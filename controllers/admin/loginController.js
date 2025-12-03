require("dotenv").config();
const mongoose = require("mongoose");
const constant = require("../../config/constant");
const USER = require("../../models/user/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ==============================================
// UNIFIED LOGIN - ACCEPTS EMAIL OR USERNAME
// ==============================================
exports.login = async (req, res) => {
  try {
    let data = req.body;
    
    console.log("🔍 Login Attempt with:", data);
    
    // Validate input - accept either email or username
    if (!data.identifier && !data.username && !data.email) {
      return res.send({
        code: constant.errorCode,
        message: "Email or username is required",
      });
    }
    
    if (!data.password) {
      return res.send({
        code: constant.errorCode,
        message: "Password is required",
      });
    }
    
    // Determine what was provided (email or username)
    const loginIdentifier = data.identifier || data.username || data.email;
    
    console.log("🔍 Looking for user with:", loginIdentifier);
    
    // Search by BOTH email AND username
    let checkUser = await USER.findOne({
      $or: [
        { email: loginIdentifier },
        { username: loginIdentifier }
      ]
    });
    
    if (checkUser) {
      console.log("✅ User Found:", {
        _id: checkUser._id,
        username: checkUser.username,
        email: checkUser.email,
        role: checkUser.role,
        status: checkUser.status,
        hashedPasswordLength: checkUser.password ? checkUser.password.length : 0
      });
    } else {
      console.log("❌ User NOT Found with identifier:", loginIdentifier);
    }
    
    if (!checkUser) {
      return res.send({
        code: constant.errorCode,
        message: "Invalid credentials",
      });
    }
    
    // Check if account is active
    if (!checkUser.status) {
      console.log("❌ User account is blocked");
      return res.send({
        code: constant.errorCode,
        message: "Your account is blocked",
      });
    }
    
    // Compare passwords
    console.log("🔐 Comparing passwords...");
    console.log("   Input password:", data.password);
    console.log("   Stored hash preview:", checkUser.password ? checkUser.password.substring(0, 30) + "..." : "NO HASH");
    
    let checkPassword = await bcrypt.compare(
      data.password,
      checkUser.password
    );
    
    console.log("🔐 Password Match Result:", checkPassword);
    
    if (!checkPassword) {
      console.log("❌ Password comparison FAILED");
      return res.send({
        code: constant.errorCode,
        message: "Invalid credentials",
      });
    }
    
    console.log("✅ Login Successful for:", checkUser.username || checkUser.email);
    
    // Generate JWT token
    let token = jwt.sign(
      {
        userId: checkUser._id,
        status: checkUser.status,
        role: checkUser.role,
      },
      process.env.JWTSECRET,
      { expiresIn: "1d" }
    );
    
    return res.send({
      code: constant.successCode,
      message: "Login Successfully",
      result: {
        _id: checkUser._id,
        email: checkUser.email,
        username: checkUser.username,
        token: token,
        role: checkUser.role,
        status: checkUser.status,
        firstName: checkUser.firstName,
        lastName: checkUser.lastName,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

// ==============================================
// USER LOGIN - UPDATED TO ACCEPT ALL ROLES
// ==============================================
exports.userLogin = async (req, res) => {
  try {
    let data = req.body;
    
    // Accept email, username, or identifier
    const loginIdentifier = data.identifier || data.username || data.email;
    
    console.log("🔍 User Login Attempt with:", loginIdentifier);
    
    if (!loginIdentifier) {
      return res.send({
        code: constant.errorCode,
        message: "Email or username is required",
      });
    }
    
    // Search by BOTH email AND username for flexibility
    let checkEmail = await USER.findOne({
      $or: [
        { email: loginIdentifier },
        { username: loginIdentifier }
      ]
    });
    
    if (!checkEmail) {
      console.log("❌ User not found with:", loginIdentifier);
      return res.send({
        code: constant.errorCode,
        message: "Invalid credentials",
      });
    }
    
    console.log("✅ User Found:", {
      username: checkEmail.username,
      email: checkEmail.email,
      role: checkEmail.role,
      status: checkEmail.status
    });
    
    if (!checkEmail.status) {
      console.log("❌ Account blocked");
      return res.send({
        code: constant.errorCode,
        message: "Your account is blocked",
      });
    }
    
    // REMOVED ROLE CHECK - Now accepts all roles (user, dealer, admin)
    // if (checkEmail.role != "user") {
    //   console.log("❌ Invalid role:", checkEmail.role);
    //   return res.send({
    //     code: constant.errorCode,
    //     message: "Invalid Credentials",
    //   });
    // }
    
    console.log("🔐 Comparing passwords...");
    let checkPassword = await bcrypt.compare(
      data.password,
      checkEmail.password
    );
    
    console.log("🔐 Password Match Result:", checkPassword);
    
    if (!checkPassword) {
      console.log("❌ Password mismatch");
      return res.send({
        code: constant.errorCode,
        message: "Invalid credentials",
      });
    }
    
    console.log("✅ Login Successful for role:", checkEmail.role);
    
    let token = jwt.sign(
      {
        userId: checkEmail._id,
        status: checkEmail.status,
        role: checkEmail.role,
      },
      process.env.JWTSECRET,
      { expiresIn: "1d" }
    );
    
    return res.send({
      code: constant.successCode,
      message: "Login Successfully",
      result: { 
        _id: checkEmail._id,
        email: checkEmail.email,
        username: checkEmail.username,
        token: token,
        role: checkEmail.role,
        status: checkEmail.status,
        firstName: checkEmail.firstName,
        lastName: checkEmail.lastName,
      },
    });
  } catch (err) {
    console.error("❌ User login error:", err);
    return res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

// ==============================================
// CREATE SUPER ADMIN
// ==============================================
exports.createSuperAdmin = async (req, res) => {
  try {
    let superObject = {
      email: "super@chiptuning.com",
      username: "superadmin", // Added username
      password: bcrypt.hashSync("super123", 10),
      role: "admin",
      status: true,
      firstName: "Super",
      lastName: "Admin",
      phoneNo: 9797979797,
    };

    let checkEmail = await USER.findOne({
      email: superObject.email,
    });
    
    if (checkEmail) {
      return res.send({
        code: constant.errorCode,
        message: "Email already exist",
      });
    }
    
    let createData = await USER(superObject).save();
    
    return res.send({
      code: constant.successCode,
      message: "Super Admin Created Successfully",
      result: createData,
    });
  } catch (err) {
    console.error("❌ Super admin creation error:", err);
    return res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};




// ==============================================
// REGISTER USER
// ==============================================
exports.registerUser = async (req, res) => {
  try {
    let data = req.body;
    
    // Check if email already exists
    let checkEmail = await USER.findOne({ email: data.email });
    if (checkEmail) {
      return res.send({
        code: constant.errorCode,
        message: "Email already exist",
      });
    }
    
    // Check if username already exists (if provided)
    if (data.username) {
      let checkUsername = await USER.findOne({ username: data.username });
      if (checkUsername) {
        return res.send({
          code: constant.errorCode,
          message: "Username already taken",
        });
      }
    }
    
    // Hash password
    let hashPassword = bcrypt.hashSync(data.password, 10);
    data.role = "user"; // FIXED TYPO: was "rple"
    data.password = hashPassword;
    
    let createData = await USER(data).save();
    
    if (!createData) {
      return res.send({
        code: constant.errorCode,
        message: "User not created",
      });
    }
    
    return res.send({
      code: constant.successCode,
      message: "User created successfully",
      result: createData,
    });
  } catch (err) {
    console.error("❌ User registration error:", err);
    return res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};