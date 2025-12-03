const DEALER = require("../../models/dealer/dealer");
const USER = require("../../models/user/user");
const constant = require("../../config/constant");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

// AWS SES Email Configuration
const transporter = nodemailer.createTransport({
  host: process.env.AWS_SES_HOST || "email-smtp.us-east-1.amazonaws.com",
  port: process.env.AWS_SES_PORT || 587,
  secure: false,
  auth: {
    user: process.env.AWS_SES_USER,
    pass: process.env.AWS_SES_PASSWORD,
  },
});

// Send Login Credentials Email
const sendLoginCredentialsEmail = async (email, name, username, password) => {
  const mailOptions = {
    from: process.env.AWS_SES_FROM_EMAIL,
    to: email,
    subject: "Your Dealer Account Has Been Approved - Login Credentials",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .credentials { background-color: #fff; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; padding: 20px; }
          .warning { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Our Platform!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Congratulations! Your dealer account has been successfully approved and activated.</p>
            
            <div class="credentials">
              <h3>Your Login Credentials:</h3>
              <p><strong>Username:</strong> ${username}</p>
              <p><strong>Password:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px; font-size: 16px;">${password}</code></p>
            </div>
        
            <p>You can now access your dealer dashboard and start managing your account.</p>
            
            <p style="margin-top: 25px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p style="margin-top: 20px;">Best regards,<br><strong>The Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>© ${new Date().getFullYear()} All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    return error;
  }
};

// Create Dealer Request
exports.createDealerRequest = async (req, res) => {
  try {
    const { business_name, full_name, phone, email, country, message } =
      req.body;

    if (!business_name || !full_name || !phone || !email || !country) {
      return res.send({
        code: constant.errorCode,
        message: "All required fields must be filled.",
      });
    }

    const saveDealer = await DEALER({
      business_name,
      full_name,
      phone,
      email,
      country,
      message,
      status: "pending",
    }).save();

    res.send({
      code: constant.successCode,
      message: "Dealer request submitted successfully.",
      result: saveDealer,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

// Get All Dealer Requests
exports.getAllDealerRequests = async (req, res) => {
  try {
    const dealers = await DEALER.find().sort({ createdAt: -1 });

    res.send({
      code: constant.successCode,
      message: "Success",
      result: dealers,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

// Approve Dealer with Manual Credentials
exports.approveDealer = async (req, res) => {
  try {
    const dealerId = req.params.dealerId;
    const { username, password } = req.body;    
    if (!username || !password) {
      return res.send({
        code: constant.errorCode,
        message: "Username and password are required"
      });
    }
    
    if (password.length < 6) {
      return res.send({
        code: constant.errorCode,
        message: "Password must be at least 6 characters long"
      });
    }
    
    const dealer = await DEALER.findById(dealerId);
    if (!dealer) {
      return res.send({
        code: constant.errorCode,
        message: "Dealer request not found"
      });
    }
    
    if (dealer.status === "approved") {
      return res.send({
        code: constant.errorCode,
        message: "Dealer already approved"
      });
    }

    // Check if email already exists
    const existingUser = await USER.findOne({ email: dealer.email });
    if (existingUser) {
      return res.send({
        code: constant.errorCode,
        message: "User with this email already exists"
      });
    }

    // Check if username already exists
    const existingUsername = await USER.findOne({ username: username });
    if (existingUsername) {
      return res.send({
        code: constant.errorCode,
        message: "Username already taken. Please choose a different username."
      });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = await USER({
      email: dealer.email,
      username: username,
      password: hashedPassword,
      firstName: dealer.full_name.split(' ')[0] || dealer.full_name,
      lastName: dealer.full_name.split(' ').slice(1).join(' ') || '',
      role: "dealer",
      status: true 
    }).save();     
    // Update dealer status
    dealer.status = "approved";
    dealer.approvedAt = new Date();
    dealer.userId = newUser._id;
    await dealer.save();
    
    // Send email with credentials
    let emailSent = false;
    let emailError = null;
    
    try {
      await sendLoginCredentialsEmail(dealer.email, dealer.full_name, username, password);
      emailSent = true;
    } catch (error) {
      emailError = error.message;
      console.error("❌ Email sending failed:", error.message);
    }
    
    return res.send({
      code: constant.successCode,
      message: emailSent 
        ? "Dealer approved & login created. Email sent with credentials."
        : "Dealer approved & login created. Email sending failed - please send credentials manually.",
      result: {
        user: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status
        },
        dealer: dealer,
        emailSent: emailSent,
        emailError: emailError
      }
    });

  } catch (err) {
    console.error("❌ Error in approveDealer:", err);
    return res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};
exports.getDealerProfile = async (req, res) => {
  try {
    const userId = req.userId; 
    
    // Find the user
    const user = await USER.findById(userId).select('-password');
    if (!user) {
      return res.send({
        code: constant.errorCode,
        message: "User not found"
      });
    }

    // Find the dealer information
    const dealer = await DEALER.findOne({ userId: userId });
    if (!dealer) {
      return res.send({
        code: constant.errorCode,
        message: "Dealer information not found"
      });
    }

    return res.send({
      code: constant.successCode,
      message: "Profile retrieved successfully",
      result: {
        dealer: {
          _id: dealer._id,
          business_name: dealer.business_name,
          full_name: dealer.full_name,
          phone: dealer.phone,
          email: dealer.email,
          country: dealer.country,
          message: dealer.message,
          status: dealer.status,
          approvedAt: dealer.approvedAt,
          createdAt: dealer.createdAt
        }
      }
    });

  } catch (err) {
    console.error("❌ Error in getDealerProfile:", err);
    return res.send({
      code: constant.errorCode,
      message: err.message
    });
  }
};
exports.updateDealerProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      firstName, 
      lastName, 
      business_name, 
      full_name, 
      phone, 
      country 
    } = req.body;
    const dealer = await DEALER.findOne({ userId: userId });
    if (!dealer) {
      return res.send({
        code: constant.errorCode,
        message: "Dealer information not found"
      });
    }   
    if (business_name) dealer.business_name = business_name;
    if (full_name) dealer.full_name = full_name;
    if (phone) dealer.phone = phone;
    if (country) dealer.country = country;
    
    await dealer.save();

    const updatedUser = await USER.findById(userId).select('-password');

    return res.send({
      code: constant.successCode,
      message: "Profile updated successfully",
      result: {
        dealer: {
          _id: dealer._id,
          business_name: dealer.business_name,
          full_name: dealer.full_name,
          phone: dealer.phone,
          email: dealer.email,
          country: dealer.country,
          message: dealer.message,
          status: dealer.status
        }
      }
    });

  } catch (err) {
    console.error("❌ Error in updateDealerProfile:", err);
    return res.send({
      code: constant.errorCode,
      message: err.message
    });
  }
};
exports.updateDealerPassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.send({
        code: constant.errorCode,
        message: "All password fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.send({
        code: constant.errorCode,
        message: "New password and confirm password do not match"
      });
    }

    // Check password length
    if (newPassword.length < 6) {
      return res.send({
        code: constant.errorCode,
        message: "New password must be at least 6 characters long"
      });
    }

    // Find user with password field
    const user = await USER.findById(userId);
    if (!user) {
      return res.send({
        code: constant.errorCode,
        message: "User not found"
      });
    }

    // Verify current password
    const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.send({
        code: constant.errorCode,
        message: "Current password is incorrect"
      });
    }

    // Check if new password is same as current password
    const isSamePassword = bcrypt.compareSync(newPassword, user.password);
    if (isSamePassword) {
      return res.send({
        code: constant.errorCode,
        message: "New password cannot be the same as current password"
      });
    }

    // Hash and update new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.send({
      code: constant.successCode,
      message: "Password updated successfully"
    });

  } catch (err) {
    console.error("❌ Error in updateDealerPassword:", err);
    return res.send({
      code: constant.errorCode,
      message: err.message
    });
  }
};