require("dotenv").config();
const mongoose = require("mongoose");
const constant = require("../../config/constant");
const USER = require("../../models/user/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// UNIFIED LOGIN - ACCEPTS EMAIL OR USERNAME
exports.login = async (req, res) => {
  try {
    let data = req.body;    
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
        const loginIdentifier = data.identifier || data.username || data.email;    
    let checkUser = await USER.findOne({
      $or: [
        { email: loginIdentifier },
        { username: loginIdentifier }
      ]
    });
    
    if (!checkUser) {
      return res.send({
        code: constant.errorCode,
        message: "Invalid credentials",
      });
    }
        if (!checkUser.status) {
      return res.send({
        code: constant.errorCode,
        message: "Your account is blocked",
      });
    }
    let checkPassword = await bcrypt.compare(
      data.password,
      checkUser.password
    );    
    if (!checkPassword) {
      return res.send({
        code: constant.errorCode,
        message: "Invalid credentials",
      });
    }    
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
// USER LOGIN - UPDATED TO ACCEPT ALL ROLES

exports.userLogin = async (req, res) => {
  try {
    let data = req.body;
    
    // Accept email, username, or identifier
    const loginIdentifier = data.identifier || data.username || data.email;    
    if (!loginIdentifier) {
      return res.send({
        code: constant.errorCode,
        message: "Email or username is required",
      });
    }
        let checkEmail = await USER.findOne({
      $or: [
        { email: loginIdentifier },
        { username: loginIdentifier }
      ]
    });
    
    if (!checkEmail) {
      return res.send({
        code: constant.errorCode,
        message: "Invalid credentials",
      });
    }  
    if (!checkEmail.status) {
      return res.send({
        code: constant.errorCode,
        message: "Your account is blocked",
      });
    }
         let checkPassword = await bcrypt.compare(
      data.password,
      checkEmail.password
    );    
    if (!checkPassword) {
      return res.send({
        code: constant.errorCode,
        message: "Invalid credentials",
      });
    }    
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

// CREATE SUPER ADMIN
exports.createSuperAdmin = async (req, res) => {
  try {
    let superObject = {
      email: "super@chiptuning.com",
      username: "superadmin", 
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
// REGISTER USER
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