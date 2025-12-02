const DEALER = require("../../models/dealer/dealer");
const USER = require("../../models/user/user");
const constant = require("../../config/constant");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

// AWS SES Email Configuration
const transporter = nodemailer.createTransport({
  host: process.env.AWS_SES_HOST || 'email-smtp.us-east-1.amazonaws.com', // Change region as needed
  port: process.env.AWS_SES_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.AWS_SES_USER, // SMTP Username from AWS SES
    pass: process.env.AWS_SES_PASSWORD // SMTP Password from AWS SES
  }
});

// Send Login Credentials Email
const sendLoginCredentialsEmail = async (email, name, password) => {
  const mailOptions = {
    from: process.env.AWS_SES_FROM_EMAIL, // Must be verified in AWS SES
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
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px; font-size: 16px;">${password}</code></p>
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

  await transporter.sendMail(mailOptions);
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

// Approve Dealer (with Email)
exports.approveDealer = async (req, res) => {
  try {
    const dealerId = req.params.dealerId;

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

    // Check if user already exists
    const existingUser = await USER.findOne({ email: dealer.email });
    if (existingUser) {
      return res.send({
        code: constant.errorCode,
        message: "User with this email already exists"
      });
    }

    // Generate random password
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create login for dealer
    const newUser = await USER({
      name: dealer.full_name,
      email: dealer.email,
      password: hashedPassword,
      role: "dealer",
      isActive: true
    }).save();

    // Update dealer status
    dealer.status = "approved";
    dealer.approvedAt = new Date();
    await dealer.save();

    // Send email with login credentials
    try {
      await sendLoginCredentialsEmail(dealer.email, dealer.full_name, randomPassword);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue even if email fails - user is still created
    }

    res.send({
      code: constant.successCode,
      message: "Dealer approved & login created. Email sent with credentials.",
      result: {
        user: newUser,
        dealer: dealer
      }
    });

  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

// Reject Dealer (New API)
exports.rejectDealer = async (req, res) => {
  try {
    const dealerId = req.params.dealerId;
    const { reason } = req.body;

    const dealer = await DEALER.findById(dealerId);
    if (!dealer) {
      return res.send({
        code: constant.errorCode,
        message: "Dealer request not found"
      });
    }

    if (dealer.status === "rejected") {
      return res.send({
        code: constant.errorCode,
        message: "Dealer already rejected"
      });
    }

    if (dealer.status === "approved") {
      return res.send({
        code: constant.errorCode,
        message: "Cannot reject an approved dealer"
      });
    }

    // Update dealer status
    dealer.status = "rejected";
    dealer.rejectionReason = reason || "Not specified";
    dealer.rejectedAt = new Date();
    await dealer.save();

    // Send rejection email
    try {
      await sendRejectionEmail(dealer.email, dealer.full_name, reason);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue even if email fails
    }

    res.send({
      code: constant.successCode,
      message: "Dealer rejected successfully. Notification email sent.",
      result: dealer
    });

  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};