require("dotenv").config();
const { verify } = require("crypto")
const jwt = require("jsonwebtoken")
const USER = require("../models/user/user")
const constant = require("./constant")

verifyToken = async (req, res, next) => {
    let token = req.headers["x-access-token"]
    if (!token) {
        res.send({
            code: constant.tokenErrorCode,
            message: "Token is required"
        })
    } else {
        jwt.verify(token, process.env.JWTSECRET, async (err, decoded) => {
            if (err) {
                res.send({
                    code: constant.tokenErrorCode,
                    message: "Auth token verification failed"
                })
                return
            }decoded
            let checkUser = await USER.findById(decoded.userId)
            if (!checkUser) {
                res.send({
                    code: constant.tokenErrorCode,
                    message: "Please login again"
                })
                return
            }
            if (!checkUser.status) {
                res.send({
                    code: constant.tokenErrorCode,
                    message: "Your account is blocked"
                })
                return
            }
            req.userId = decoded.userId;
            req.email = decoded.email;
            req.role = decoded.role;
            req.status = decoded.status;
            next();
        })
    }
}
const authJwt = {
    verifyToken: verifyToken,
  };
  module.exports = authJwt