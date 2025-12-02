const DEALER = require("../../models/dealer/dealer");
const USER = require("../../models/user/user");
const constant = require("../../config/constant");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

// AWS SES Email Configuration
const transporter = nodemailer.createTransport({
  host: process.env.AWS_SES_HOST || 'email-smtp.us-east-1.amazonaws.com',
  port: process.env.AWS_SES_PORT || 587,
  secure: false,
  auth: {
    user: process.env.AWS_SES_USER,
    pass: process.env.AWS_SES_PASSWORD
  }
});

// Send Login Credentials Email
const sendLoginCredentialsEmail = async (email, name, username, password) => {
  console.log("========================================");
  console.log("📧 ATTEMPTING TO SEND EMAIL");
  console.log("========================================");
  console.log("To:", email);
  console.log("Name:", name);
  console.log("Username:", username);
  console.log("Password:", password);
  console.log("========================================");
  console.log("SMTP Configuration:");
  console.log("Host:", process.env.AWS_SES_HOST || 'email-smtp.us-east-1.amazonaws.com');
  console.log("Port:", process.env.AWS_SES_PORT || 587);
  console.log("From Email:", process.env.AWS_SES_FROM_EMAIL);
  console.log("SMTP User:", process.env.AWS_SES_USER ? "✓ Set" : "✗ Not Set");
  console.log("SMTP Password:", process.env.AWS_SES_PASSWORD ? "✓ Set" : "✗ Not Set");
  console.log("========================================");

  const mailOptions = {
    from: process.env.AWS_SES_FROM_EMAIL,
    to: email,
    subject: 'Your Dealer Account Has Been Approved - Login Credentials',
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
            
            <div class="warning">
              <strong>⚠️ Important Security Notice:</strong>
              <p style="margin: 5px 0 0 0;">Please change your password immediately after your first login for security purposes.</p>
            </div>
            
            <p>You can now access your dealer dashboard and start managing your account.</p>
            
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/login" class="button">Login to Dashboard</a>
            
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
    `
  };

  try {
    console.log("📤 Sending email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ EMAIL SENT SUCCESSFULLY!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    console.log("========================================");
    return info;
  } catch (error) {
    console.error("❌ EMAIL SENDING FAILED!");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("Error Code:", error.code);
    console.error("Full Error:", error);
    console.log("========================================");
    throw error;
  }
};

// Create Dealer Request
exports.createDealerRequest = async (req, res) => {
  try {
    const { business_name, full_name, phone, email, country, message } = req.body;

    if (!business_name || !full_name || !phone || !email || !country) {
      return res.send({
        code: constant.errorCode,
        message: "All required fields must be filled."
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
      result: saveDealer
    });

  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message
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
      result: dealers
    });

  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message
    });
  }
};

// Approve Dealer with Manual Credentials
exports.approveDealer = async (req, res) => {
  try {
    console.log("\n🔄 APPROVE DEALER REQUEST RECEIVED");
    console.log("Dealer ID:", req.params.dealerId);
    console.log("Request Body:", req.body);
    
    const dealerId = req.params.dealerId;
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      console.log("❌ Validation failed: Missing username or password");
      return res.send({
        code: constant.errorCode,
        message: "Username and password are required"
      });
    }

    // Validate password strength
    if (password.length < 6) {
      console.log("❌ Validation failed: Password too short");
      return res.send({
        code: constant.errorCode,
        message: "Password must be at least 6 characters long"
      });
    }

    console.log("✓ Input validation passed");

    const dealer = await DEALER.findById(dealerId);
    if (!dealer) {
      console.log("❌ Dealer not found");
      return res.send({
        code: constant.errorCode,
        message: "Dealer request not found"
      });
    }

    console.log("✓ Dealer found:", dealer.email);

    if (dealer.status === "approved") {
      console.log("❌ Dealer already approved");
      return res.send({
        code: constant.errorCode,
        message: "Dealer already approved"
      });
    }

    // Check if user already exists with this email
    const existingUser = await USER.findOne({ email: dealer.email });
    if (existingUser) {
      console.log("❌ User with email already exists");
      return res.send({
        code: constant.errorCode,
        message: "User with this email already exists"
      });
    }

    // Check if username already exists
    const existingUsername = await USER.findOne({ username: username });
    if (existingUsername) {
      console.log("❌ Username already taken:", username);
      return res.send({
        code: constant.errorCode,
        message: "Username already taken. Please choose a different username."
      });
    }

    console.log("✓ Username available");

    // Hash the password
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✓ Password hashed");

    // Create login for dealer
    console.log("👤 Creating user account...");
    const newUser = await USER({
      name: dealer.full_name,
      username: username,
      email: dealer.email,
      password: hashedPassword,
      role: "dealer",
      isActive: true
    }).save();
    console.log("✓ User created with ID:", newUser._id);

    // Update dealer status
    console.log("📝 Updating dealer status...");
    dealer.status = "approved";
    dealer.approvedAt = new Date();
    dealer.userId = newUser._id;
    await dealer.save();
    console.log("✓ Dealer status updated");

    // Send email with login credentials
    console.log("\n📧 Preparing to send email...");
    let emailSent = false;
    let emailError = null;
    
    try {
      await sendLoginCredentialsEmail(dealer.email, dealer.full_name, username, password);
      emailSent = true;
      console.log("✅ Email sent successfully!\n");
    } catch (error) {
      emailError = error.message;
      console.error("❌ Email sending failed but continuing...");
      console.error("Error:", error.message, "\n");
    }

    console.log("✅ DEALER APPROVAL COMPLETED");
    console.log("Email Status:", emailSent ? "Sent ✓" : `Failed - ${emailError}`);
    console.log("========================================\n");

    res.send({
      code: constant.successCode,
      message: emailSent 
        ? "Dealer approved & login created. Email sent with credentials."
        : "Dealer approved & login created. Email sending failed - please send credentials manually.",
      result: {
        user: newUser,
        dealer: dealer,
        emailSent: emailSent,
        emailError: emailError
      }
    });

  } catch (err) {
    console.error("\n❌ ERROR IN APPROVE DEALER:");
    console.error("Error Message:", err.message);
    console.error("Error Stack:", err.stack);
    console.log("========================================\n");
    
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};
