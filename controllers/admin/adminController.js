const mongoose = require("mongoose")
const MAKE = require("../../models/car/make")
const GENERATION = require("../../models/car/generation")
const MODEL = require("../../models/car/model")
const ENGINE = require("../../models/car/engine")
const constant = require("../../config/constant")

exports.createMake = async (req, res) => {
    try {
        let data = req.body

        //checking the type in payload
        if (data.make == "") {
            res.send({
                code: constant.errorCode,
                message: "make is required"
            })
            return
        }
        //checking the unique identifier
        let checkmake = await MAKE.findOne({ make: data.make })
        if (checkmake) {
            res.send({
                code: constant.errorCode,
                message: "make already exists"
            })
            return;
        }
        //save data in to db
        let saveData = await MAKE(data).save()
        res.send({
            code: constant.successCode,
            message: "Success",
            result: saveData
        })
    } catch (err) {
        res.send({
            code: constant.errorCode,
            message: err.message
        })
    }
}

exports.createModel = async (req, res) => {
    try {
        let data = req.body

        //checking the model in payload
        if (data.model == "" || data.make == "") {
            res.send({
                code: constant.errorCode,
                message: "model and make is required"
            })
            return
        }
        //checking the unique identifier
        let checkmake = await MAKE.findOne({ make: data.make })
        if (!checkmake) {
            res.send({
                code: constant.errorCode,
                message: "Invalid make is provided"
            })
            return;
        }

        let checkmodel = await MODEL.findOne({ model: data.model })
        if (checkmodel) {
            res.send({
                code: constant.errorCode,
                message: "model already exists"
            })
            return;
        }
        //save data in to db
        data.makeId = checkmake._id

        let saveData = await MODEL(data).save()
        res.send({
            code: constant.successCode,
            message: "Success",
            result: saveData
        })
    } catch (err) {
        res.send({
            code: constant.errorCode,
            message: err.message
        })
    }
}

exports.createGeneration = async (req, res) => {
    try {
        let data = req.body
        let checkmake = await MAKE.findOne({ make: data.make })
        if (!checkmake) {
            res.send({
                code: constant.errorCode,
                message: "Invalid make is provided"
            })
            return;
        }

        let checkmodel = await MODEL.findOne({ model: data.model })
        if (!checkmodel) {
            res.send({
                code: constant.errorCode,
                message: "Invalid model is provided"
            })
            return;
        }
        data.makeId = checkmake._id
        data.modelId = checkmodel._id
        let saveData = await GENERATION(data).save()
        res.send({
            code: constant.successCode,
            message: "Success",
            result: saveData
        })
    } catch (err) {
        res.send({
            code: constant.errorCode,
            message: err.message
        })
    }
}

exports.createEngine = async (req, res) => {
    try {
        let data = req.body
         
     }
    catch (err) {
        res.send({
            code: constant.errorCode,
            message: err.message
        })
    }
}