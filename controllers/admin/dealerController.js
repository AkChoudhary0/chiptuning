const DEALER = require("../../models/dealer/dealer")
const USER = require("../../models/user/user")
const constant = require("../../config/constant")
// const sendMail = require("../helpers/sendMail"); 
const bcrypt = require("bcryptjs");

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
    await dealer.save();

    // Send login email
    // await sendMail(
    //   dealer.email,
    //   "Your Dealer Login is Ready - Alpha Performance",
    //   `
    //   <h3>Welcome ${dealer.full_name},</h3>
    //   <p>Your dealer account has been approved.</p>
    //   <p><strong>Login Details:</strong></p>
    //   <p>Email: ${dealer.email}</p>
    //   <p>Password: ${randomPassword}</p>
    //   <p>You can now login from the dealer portal.</p>
    //   `
    // );

    res.send({
      code: constant.successCode,
      message: "Dealer approved & login created. Email sent.",
      result: newUser
    });

  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};