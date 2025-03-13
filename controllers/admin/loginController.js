require("dotenv").config();
const mongoose = require("mongoose");
const constant = require("../../config/constant");
const USER = require("../../models/user/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    let data = req.body;
    let checkEmail = await USER.findOne({ email: data.email });
    if (!checkEmail) {
      res.send({
        code: constant.errorCode,
        message: "Invalid credentialsv",
      });
      return;
    }
    if (!checkEmail.status) {
      res.send({
        code: constant.errorCode,
        message: "Your account is blocked",
      });
      return;
    }
    if (!checkEmail.role != "user") {
      res.send({
        code: constant.errorCode,
        message: "Invalid Credentials",
      });
      return;
    }
    let checkPassword = await bcrypt.compare(
      data.password,
      checkEmail.password
    );
    if (!checkPassword) {
      res.send({
        code: constant.errorCode,
        message: "Invalid credentials",
      });
      return;
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
    res.send({
      code: constant.successCode,
      message: "Login Successfully",
      result: {
        email: checkEmail.email,
        token: token,
        role: checkEmail.role,
        status: checkEmail.status,
        firstName: checkEmail.firstName,
        lastName: checkEmail.lastName,
      },
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

exports.createSuperAdmin = async (req, res) => {
  try {
    let superObject = {
      email: "super@chiptuning.com",
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
      res.send({
        code: constant.errorCode,
        message: "Email already exist",
      });
      return;
    }
    let createData = await USER(superObject).save();
    res.send({
      code: constant.successCode,
      message: "Super Admin Created Successfully",
      result: createData,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

exports.registerUser = async (req, res) => {
  try {
    let data = req.body;
    let checkEmail = await USER.findOne({ email: data.email });
    if (checkEmail) {
      res.send({
        code: constant.errorCode,
        message: "Email already exist",
      });
      return;
    }
    let hashPassword = await bcrypt.hashSync(data.password, 10);
    data.rple = "user";
    data.password = hashPassword;
    let createData = await USER(data).save();
    if (!createData) {
      res.send({
        code: constant.errorCode,
        message: "User not created",
      });
    } else {
      res.send({
        code: constant.successCode,
        message: "User created successfully",
        result: createData,
      });
    }
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};
