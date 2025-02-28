const mongoose = require("mongoose")
const TYPE = require("../../models/car/type")
const GENERATION = require("../../models/car/generation")
const MODEL = require("../../models/car/model")
const ENGINE = require("../../models/car/engine")
const constant = require("../../config/constant")

exports.createType = async (req, res) => {
    try {
        let data = req.body

        //checking the type in payload
        if (data.type == "") {
            res.send({
                code: constant.errorCode,
                message: "Type is required"
            })
            return
        }
        //checking the unique identifier
        let checkType = await TYPE.findOne({ type: data.type })
        if (checkType) {
            res.send({
                code: constant.errorCode,
                message: "Type already exists"
            })
            return;
        }
        //save data in to db
        let saveData = await TYPE(data).save()
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
        if (data.model == "" || data.type == "") {
            res.send({
                code: constant.errorCode,
                message: "model and type is required"
            })
            return
        }
        //checking the unique identifier
        let checkType = await TYPE.findOne({ type: data.type })
        if (!checkType) {
            res.send({
                code: constant.errorCode,
                message: "Invalid type is provided"
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
        data.typeId = checkType._id

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
        let checkType = await TYPE.findOne({ type: data.type })
        if (!checkType) {
            res.send({
                code: constant.errorCode,
                message: "Invalid type is provided"
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
        data.typeId = checkType._id
        data.modelId = checkmodel._id
        let saveData =  await GENERATION(data).save()
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