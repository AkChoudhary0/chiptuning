const mongoose = require("mongoose")
const MAKE = require("../../models/car/make")
const GENERATION = require("../../models/car/generation")
const MODEL = require("../../models/car/model")
const ENGINE = require("../../models/car/engine")
const constant = require("../../config/constant")
//Create Make

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

//Create Model
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
        let checkmake = await MAKE.findOne({ _id: data.make })
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

//Create Generation
exports.createGeneration = async (req, res) => {
    try {
        let data = req.body
        let checkmake = await MAKE.findOne({ _id: data.make })
        if (!checkmake) {
            res.send({
                code: constant.errorCode,
                message: "Invalid make is provided"
            })
            return;
        }

        let checkmodel = await MODEL.findOne({ _id: data.model })
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

// Create Engine 
exports.createEngine = async (req, res) => {
    try {
        let data = req.body
        let checkMake = await MAKE.findOne({ _id: data.make })
        if (!checkMake) {
            res.send({
                code: constant.errorCode,
                message: "Invalid make is provided!"
            });
            return;
        }
        let checkModel = await MODEL.findOne({ _id: data.model })
        if (!checkModel) {
            res.send({
                code: constant.errorCode,
                message: "Invalid model is provided!"
            })
            return
        }
        let checkGeneration = await GENERATION.findOne({ _id: data.generation });
        if (!checkGeneration) {
            res.send({
                code: constant.errorCode,
                message: "Invalid generation provided"
            })
        }
        data.makeId = checkMake._id
        data.modelId = checkModel._id
        data.generationId = checkGeneration._id
        let saveData = await ENGINE(data).save()
        res.send({
            code: constant.successCode,
            message: "Success",
            result: saveData
        })
    }
    catch (err) {
        res.send({
            code: constant.errorCode,
            message: err.message
        })
    }
}

// Get All Makes
exports.getMakes = async (req, res) => {
    try {
        let allMakes = await MAKE.find({})
        res.send({
            code: constant.successCode,
            result: allMakes
        })
    }
    catch (err) {
        res.send({
            code: constant.errorCode,
            message: err.message
        })
    }
}

//Get Model By type id
exports.getModelByMakeId = async (req, res) => {
    try {
        let data = req.body
        let checkMake = await MAKE.find({ _id:req.params.makeId, status: true, isDeleted: false })
        if (!checkMake) {
            res.send({
                code: constant.errorCode,
                message: "Invalid Id!"
            })
            return
        }

        let models = await MODEL.find({ makeId: req.params.makeId, status: true, isDeleted: false })
        res.send({
            code: constant.successCode,
            result: models
        })
    }
    catch (err) {
        res.send({
            code: constant.errorCode,
            message: err.message
        })
    }
}

//Get Generation by Model and Make

exports.getGenerationById = async (req, res) => {
    try {
        let checkMake = await MAKE.findOne({ _id: data.makeId, isDeleted: false, status: true });
        if (!checkMake) {
            res.send({
                code: constant.errorCode,
                message: "Invalid Make Id"
            });
            return
        }
        let checkModel = await MODEL.findOne({ _id: data.modelId, isDeleted: false, status: true });
        if (!checkModel) {
            res.send({
                code: constant.errorCode,
                message: "Invalid Model Id"
            })
        }

    }
    catch (err) {
        res.send({
            code: constant.errorCode,
            message: err.message
        })
    }
}
//Get Models
exports.getModels = async (req, res) => {
    try {
        let data = req.body
        let getModels = await MODEL.find({ status: true, isDeleted: false })
        res.send({
            code: constant.successCode,
            message: "Success",
            result: getModels
        })
    } catch (err) {
        res.send({
            code: constant.errorCode,
            message: err.message
        })
    }
}

//Get generations
exports.getGeneration = async (req, res) => {
    try {
        let data = req.body
        let getGeneration = await GENERATION.find({ status: true, isDeleted: false })
        res.send({
            code: constant.successCode,
            message: "Success",
            result: getGeneration
        })
    } catch (err) {
        res.send({
            code: constant.errorCode,
            message: err.message
        })
    }
}

//Get Engines
exports.getEngine = async (req, res) => {
    try {
        let data = req.body
        let getEngine = await ENGINE.find({ status: true, isDeleted: false }).
            res.send({
                code: constant.successCode,
                message: "Success",
                result: getEngine
            })
    } catch (err) {
        res.send({
            code: constant.errorCode,
            message: err.message
        })
    }
}

//Get Vehicle dropdown
exports.getVehicleDropDown = async (req, res) => {
    try {
        let data = req.body
        let matchMakeId = {}
        let matchModelId = {}
        let matchGenerationId = {}
        let matchEngineId = {}
        if (data.makeId != '') {
            matchMakeId = { _id: new mongoose.Types.ObjectId(data.makeId) }
        }
        if (data.modelId != '') {
            matchModelId = { _id: new mongoose.Types.ObjectId(data.modelId) }
        }
        if (data.generationId != '') {
            matchGenerationId = { _id: new mongoose.Types.ObjectId(data.generationId) }
        }
        if (data.engineId != '') {
            matchEngineId = { _id: new mongoose.Types.ObjectId(data.engineId) }
        }
        let pipeline = [
            {
                $match: {
                    $and: [
                        matchMakeId
                    ]

                }
            },
            {
                $lookup: {
                    'from': 'models',
                    'localField': '_id',
                    'foreignField': 'makeId',
                    'as': 'models',
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    matchModelId,
                                    // { 'makeId': new mongoose.Types.ObjectId(data.makeId) }
                                ]
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    'from': 'generations',
                    'localField': 'models._id',
                    'foreignField': 'modelId',
                    'as': 'generations',
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    matchGenerationId,
                                    // { 'makeId': new mongoose.Types.ObjectId(data.makeId) },
                                    // { 'modelId': new mongoose.Types.ObjectId(data.modelId) },
                                ]
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    'from': 'engines',
                    'localField': 'generations._id',
                    'foreignField': 'generationId',
                    'as': 'engines',
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    matchEngineId,
                                    // { 'makeId': new mongoose.Types.ObjectId(data.makeId) },
                                    // { 'modelId': new mongoose.Types.ObjectId(data.modelId) },
                                    // { 'generationId': new mongoose.Types.ObjectId(data.generationId) },
                                ]
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    make: 1,
                    models: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$models",
                                    as: "modelData",
                                    cond: {
                                        $and: [
                                             { $eq: ["$$modelData.makeId", "$_id"] },
                                             { $ne: [data.makeId,''] },
                                            {
                                                $or: [
                                                    { $in: ["$$modelData._id", "$generations.modelId"] },  // If engines exist, match modelId
                                                    { $eq: [{ $size: "$generations" }, 0] }  // If engines array is empty, allow all models
                                                ]
                                            },
                                            {
                                                $or: [
                                                    { $in: ["$$modelData._id", "$engines.modelId"] },  // If engines exist, match modelId
                                                    { $eq: [{ $size: "$engines" }, 0] }  // If engines array is empty, allow all models
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            as: "models", // Alias for each pricebook
                            in: {
                                modelName: "$$models.model",
                                modelId: "$$models._id",
                            }
                        }
                    },
                    generations: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$generations",
                                    as: "gen",
                                    cond: {
                                        $and: [
                                            { $eq: ["$$gen.makeId", "$_id"] }, // Make sure generation belongs to the current make
                                            { $ne: [data.modelId,''] },
                                            { $ne: [data.makeId,''] },

                                            {
                                                $or: [
                                                    { $in: ["$$gen.modelId", "$models._id"] },  // If engines exist, match modelId
                                                    { $eq: [{ $size: "$models" }, 0] }  // If engines array is empty, allow all models
                                                ]
                                            },
                                            {
                                                $or: [
                                                    { $in: ["$$gen._id", "$engines.generationId"] },  // If engines exist, match modelId
                                                    { $eq: [{ $size: "$engines" }, 0] }  // If engines array is empty, allow all models
                                                ]
                                            },

                                        ]
                                    }
                                }
                            },
                            as: "generation", // Alias for each pricebook
                            in: "$$generation"
                        }
                    },
                    engines: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$engines",
                                    as: "eng",
                                    cond: {
                                        $and: [
                                            { $eq: ["$$eng.makeId", "$_id"] }, // Make sure generation belongs to the current make
                                            { $ne: [data.modelId,''] },
                                            { $ne: [data.makeId,''] },
                                            { $ne: [data.generationId,''] },
                                            // { $in: ["$$eng.modelId", "$models._id"] }, // Check if generation's modelId is in models array
                                            {
                                                $or: [
                                                    { $in: ["$$eng.modelId", "$models._id"] },  // If engines exist, match modelId
                                                    { $eq: [{ $size: "$models" }, 0] }  // If engines array is empty, allow all models
                                                ]
                                            },
                                            {
                                                $or: [
                                                    { $in: ["$$eng.generationId", "$generations._id"] },  // If engines exist, match generation id
                                                    { $eq: [{ $size: "$generations" }, 0] }  // If engines array is empty, allow all models
                                                ]
                                            },
                                        ]
                                    }
                                }
                            },
                            as: "engine", // Alias for each pricebook
                            in: "$$engine"
                        }
                    }
                }
            }

        ]
        let response = await MAKE.aggregate(pipeline)
        res.send({
            code: constant.successCode,
            result: response
        })
    }
    catch (err) {
        res.send({
            code: constant.errorCode,
            message: err.message
        })
    }
}