const mongoose = require("mongoose");
const MAKE = require("../../models/car/make");
const GENERATION = require("../../models/car/generation");
const MODEL = require("../../models/car/model");
const ENGINE = require("../../models/car/engine");
const constant = require("../../config/constant");
const engine = require("../../models/car/engine");
const USER = require("../../models/user/user");
const fs = require("fs");
const multer = require("multer");
const BLOG=require("../../models/blog/blog")
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const path = require("path");
const ECU = require("../../models/car/ecu");
const { patch } = require("../../routes/admin");
const imageUpload = require("../../middleware/imageUpload");
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

// s3 bucket connections
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});
// const StorageP = multerS3({
//   s3: s3,
//   bucket: process.env.AWS_BUCKET_NAME,
//   metadata: (req, file, cb) => {
//     cb(null, { fieldName: file.fieldname });
//   },
//   key: (req, file, cb) => {
//     const fileName =
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname);
//     const fullPath = `${fileName}`;
//     cb(null, fullPath);
//   },
// });

// var imageUpload = multer({
//   storage: StorageP,
//   limits: {
//     fileSize: 500 * 1024 * 1024, // 500 MB limit
//   },
// }).single("file");

//Create Make

exports.createMake = async (req, res) => {
  try {
    let data = req.body;

    //checking the type in payload
    if (data.make == "") {
      res.send({
        code: constant.errorCode,
        message: "make is required",
      });
      return;
    }
    //checking the unique identifier
    let checkmake = await MAKE.findOne({
      make: data.make,
      vehicle_type: data.vehicle_type,
    });
    if (checkmake) {
      res.send({
        code: constant.errorCode,
        message: "make already exists",
      });
      return;
    }
    //
    //save data in to db
    // data.isShow = data.isShow;
    // data.image = data.image
    let saveData = await MAKE(data).save();
    console.log("data saved--------", saveData, "data=======", data)
    res.send({
      code: constant.successCode,
      message: "Success",
      result: saveData
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

//Get Makes and Models
exports.getMakesWithModels = async (req, res) => {
  try {
    let query = [
      {
        $match: {
          $and:[
            {
              isDeleted:false,
            },
            {
              isShow: true
            }
          ]
          
        }
      },
      {
        $lookup: {
          from: "models",
          localField: "_id",
          foreignField: "makeId",
          as: "models"
        }
      }
    ]
    const response = await MAKE.aggregate(query)
    res.send({
      code: constant.successCode,
      message: "Success!",
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
//Create Model
exports.createModel = async (req, res) => {
  try {
    let data = req.body;
    //checking the model in payload
    if (data.model == "" || data.make == "") {
      res.send({
        code: constant.errorCode,
        message: "model and make is required",
      });
      return;
    }
    //checking the unique identifier
    let checkmake = await MAKE.findOne({ _id: data.make });
    if (!checkmake) {
      res.send({
        code: constant.errorCode,
        message: "Invalid make is provided",
      });
      return;
    }

    let checkmodel = await MODEL.findOne({
      model: data.model,
      vehicle_type: data.vehicle_type,
    });
    if (checkmodel) {
      res.send({
        code: constant.errorCode,
        message: "model already exists",
      });
      return;
    }
    //save data in to db
    data.makeId = checkmake._id;

    let saveData = await MODEL(data).save();
    res.send({
      code: constant.successCode,
      message: "Success",
      result: saveData,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

//Create Generation
exports.createGeneration = async (req, res) => {
  try {
    let data = req.body;
    let checkmake = await MAKE.findOne({ _id: data.make });
    if (!checkmake) {
      res.send({
        code: constant.errorCode,
        message: "Invalid make is provided",
      });
      return;
    }

    let checkmodel = await MODEL.findOne({ _id: data.model });
    if (!checkmodel) {
      res.send({
        code: constant.errorCode,
        message: "Invalid model is provided",
      });
      return;
    }
    data.makeId = checkmake._id;
    data.modelId = checkmodel._id;
    let saveData = await GENERATION(data).save();
    res.send({
      code: constant.successCode,
      message: "Success",
      result: saveData,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

// Create Engine
exports.createEngine = async (req, res) => {
  try {
    let data = req.body;
    let checkMake = await MAKE.findOne({ _id: data.make });
    if (!checkMake) {
      res.send({
        code: constant.errorCode,
        message: "Invalid make is provided!",
      });
      return;
    }
    let checkModel;
    if (data.model != "") {
      checkModel = await MODEL.findOne({ _id: data.model });
      if (!checkModel) {
        res.send({
          code: constant.errorCode,
          message: "Invalid model is provided!",
        });
        return;
      }
      const checkExistDetail = await ENGINE.findOne({
        modelId: data.model,
        engine: data.engine,
      });
      if (checkExistDetail) {
        res.send({
          code: constant.errorCode,
          message: "Already exist for this model!",
        });
        return;
      }
    }

    let checkGeneration;
    if (data.generation != "") {
      checkGeneration = await GENERATION.findOne({ _id: data.generation });
      if (!checkGeneration) {
        res.send({
          code: constant.errorCode,
          message: "Invalid generation provided",
        });
        return;
      }
      const checkExistDetail = await ENGINE.findOne({
        generationId: data.generation,
        engine: data.engine,
      });
      if (checkExistDetail) {
        res.send({
          code: constant.errorCode,
          message: "Already exist for this generation!",
        });
        return;
      }
    }

    data.makeId = checkMake._id;
    data.modelId = checkModel._id;
    data.generationId = checkGeneration?._id ? checkGeneration?._id : null;
    let saveData = await ENGINE(data).save();
    res.send({
      code: constant.successCode,
      message: "Success",
      result: saveData,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};
// Get All Makes

//Get Model By type id
exports.getModelByMakeId = async (req, res) => {
  try {
    let data = req.body;
    let checkMake = await MAKE.find({
      _id: req.params.makeId,
      status: true,
      isDeleted: false,
    });
    if (!checkMake) {
      res.send({
        code: constant.errorCode,
        message: "Invalid Id!",
      });
      return;
    }

    let models = await MODEL.find({
      makeId: req.params.makeId,
      status: true,
      isDeleted: false,
    });
    res.send({
      code: constant.successCode,
      message: "Success!",
      result: models,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};
//Get Generation by Model and Make

exports.getGenerationById = async (req, res) => {
  try {
    let checkMake = await MAKE.findOne({
      _id: data.makeId,
      isDeleted: false,
      status: true,
    });
    if (!checkMake) {
      res.send({
        code: constant.errorCode,
        message: "Invalid Make Id",
      });
      return;
    }
    let checkModel = await MODEL.findOne({
      _id: data.modelId,
      isDeleted: false,
      status: true,
    });
    if (!checkModel) {
      res.send({
        code: constant.errorCode,
        message: "Invalid Model Id",
      });
    }
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

//Delete Make by id
exports.deleteMakeById = async (req, res) => {
  try {
    let data = req.body;
    let checkMake = await MAKE.findOne({ _id: req.params.makeId });
    if (!checkMake) {
      res.send({
        code: constant.errorCode,
        message: "Invalid make Id!",
      });
    }
    let option = { new: true };
    let updatedResponse = await MAKE.findOneAndUpdate(
      { _id: req.params.makeId },
      { isDeleted: true },
      option
    );
    if (!updatedResponse) {
      res.send({
        code: constant.errorCode,
        message: "Unable to update",
      });
      return;
    }
    //Update Model related to makes
    let updateModels = await MODEL.updateMany(
      { makeId: req.params.makeId },
      { isDeleted: true },
      { new: true }
    );
    //Update Generation related to makes
    let updateGenerations = await GENERATION.updateMany(
      { makeId: req.params.makeId },
      { isDeleted: true },
      { new: true }
    );
    //Update Engines related to makes
    let updateEngines = await ENGINE.updateMany(
      { makeId: req.params.makeId },
      { isDeleted: true },
      { new: true }
    );
    res.send({
      code: constant.successCode,
      message: "Success!",
      result: updatedResponse,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

exports.deleteModelById = async (req, res) => {
  try {
    let data = req.body;
    let checkModel = await MODEL.findOne({ _id: req.params.modelId });
    if (!checkModel) {
      res.send({
        code: constant.errorCode,
        message: "Invalid model Id!",
      });
    }
    let option = { new: true };

    //Update Model related to makes
    let updateModels = await MODEL.updateMany(
      { _id: req.params.modelId },
      { isDeleted: true },
      { new: true }
    );
    //Update Generation related to makes
    let updateGenerations = await GENERATION.updateMany(
      { modelId: req.params.modelId },
      { isDeleted: true },
      { new: true }
    );
    //Update Engines related to makes
    let updateEngines = await ENGINE.updateMany(
      { modelId: req.params.modelId },
      { isDeleted: true },
      { new: true }
    );
    res.send({
      code: constant.successCode,
      result: updateModels,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

exports.deleteGenerationById = async (req, res) => {
  try {
    let data = req.body;
    let checkGeneration = await GENERATION.findOne({
      _id: req.params.generationId,
    });
    if (!checkGeneration) {
      res.send({
        code: constant.errorCode,
        message: "Invalid generation ID!",
      });
    }

    //Update Generation related to makes
    let updateGeneration = await GENERATION.updateMany(
      { _id: req.params.generationId },
      { isDeleted: true },
      { new: true }
    );
    //Update Engines related to makes
    let updateEngines = await ENGINE.updateMany(
      { generationId: req.params.generationId },
      { isDeleted: true },
      { new: true }
    );
    res.send({
      code: constant.successCode,
      result: updateGeneration,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

exports.deleteEngineById = async (req, res) => {
  try {
    let data = req.body;
    let checkEngine = await ENGINE.findOne({ _id: req.params.engineId });
    if (!checkEngine) {
      res.send({
        code: constant.errorCode,
        message: "Invalid engine ID!",
      });
      return
    }

    //Update Generation related to makes
    //Update Engines related to makes
    let updateEngines = await ENGINE.updateMany(
      { _id: req.params.engineId },
      { isDeleted: true },
      { new: true }
    );
    res.send({
      code: constant.successCode,
      result: updateEngines,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

exports.getMakes = async (req, res) => {
  try {
    let data = req.body;
    // { "make": { '$regex': data.make ? data.make.replace(/\s+/g, ' ').trim() : '', '$options': 'i' } }
    let allMakes = await MAKE.find({
      isDeleted: false,
      vehicle_type: req.params.makeType,
      make: {
        $regex: data.make ? data.make.replace(/\s+/g, " ").trim() : "",
        $options: "i",
      },
    });
    res.send({
      code: constant.successCode,
      message: "Success",
      result: allMakes,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

//Get Models
exports.getModels = async (req, res) => {
  try {
    let data = req.body;
    let getModels = await MODEL.aggregate([
      {
        $match: {
          $and: [
            {
              model: {
                $regex: data.model
                  ? data.model.replace(/\s+/g, " ").trim()
                  : "",
                $options: "i",
              },
            },
            { status: true },
            { vehicle_type: req.params.modelType },
            { isDeleted: false },
          ],
        },
      },
      {
        $lookup: {
          from: "makes",
          localField: "makeId",
          foreignField: "_id",
          as: "makeData",
          // pipeline: [
          //     {
          //         $match: { "make": { '$regex': data.make ? data.make.replace(/\s+/g, ' ').trim() : '', '$options': 'i' } }
          //     }
          // ]
        },
      },
      {
        $unwind: {
          path: "$makeData",
        },
      },
      {
        $match: {
          "makeData.make": {
            $regex: data.make ? data.make.replace(/\s+/g, " ").trim() : "",
            $options: "i",
          },
        },
      },
    ]);
    res.send({
      code: constant.successCode,
      message: "Success",
      result: getModels,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

//Get generations
exports.getGeneration = async (req, res) => {
  try {
    let data = req.body;
    let getGeneration = await GENERATION.aggregate([
      {
        $match: {
          $and: [
            {
              generation: {
                $regex: data.generation
                  ? data.generation.replace(/\s+/g, " ").trim()
                  : "",
                $options: "i",
              },
            },
            { status: true },
            { isDeleted: false },
            { vehicle_type: req.params.generationType },
          ],
        },
      },
      {
        $lookup: {
          from: "models",
          localField: "modelId",
          foreignField: "_id",
          as: "modelData",
        },
      },
      {
        $lookup: {
          from: "makes",
          localField: "makeId",
          foreignField: "_id",
          as: "makeData",
        },
      },
      {
        $unwind: {
          path: "$modelData",
        },
      },
      {
        $unwind: {
          path: "$makeData",
        },
      },
      {
        $match: {
          $and: [
            {
              "makeData.make": {
                $regex: data.make ? data.make.replace(/\s+/g, " ").trim() : "",
                $options: "i",
              },
            },
            {
              "modelData.model": {
                $regex: data.model
                  ? data.model.replace(/\s+/g, " ").trim()
                  : "",
                $options: "i",
              },
            },
          ],
        },
      },
    ]);
    res.send({
      code: constant.successCode,
      message: "Success",
      result: getGeneration,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

//Get Engines
exports.getEngine = async (req, res) => {
  try {
    let data = req.body;
    let getEngine = await ENGINE.aggregate([
      {
        $match: {
          $and: [
            {
              engine: {
                $regex: data.engine
                  ? data.engine.replace(/\s+/g, " ").trim()
                  : "",
                $options: "i",
              },
            },
            { isDeleted: false },
            { status: true },
            { vehicle_type: req.params.engineType },
          ],
        },
      },
      {
        $lookup: {
          from: "models",
          localField: "modelId",
          foreignField: "_id",
          as: "modelData",
        },
      },
      {
        $lookup: {
          from: "makes",
          localField: "makeId",
          foreignField: "_id",
          as: "makeData",
        },
      },
      {
        $lookup: {
          from: "generations",
          localField: "generationId",
          foreignField: "_id",
          as: "generationData",
        },
      },
      {
        $unwind: {
          path: "$modelData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$makeData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$generationData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $and: [
            {
              "makeData.make": {
                $regex: data.make ? data.make.replace(/\s+/g, " ").trim() : "",
                $options: "i",
              },
            },
            {
              "modelData.model": {
                $regex: data.model
                  ? data.model.replace(/\s+/g, " ").trim()
                  : "",
                $options: "i",
              },
            },
            //  { "generationData.generation": { '$regex': data.generation ? data.generation.replace(/\s+/g, ' ').trim() : '', '$options': 'i' } }
          ],
        },
      },
    ]);
    res.send({
      code: constant.successCode,
      message: "Success",
      result: getEngine,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

//Get Vehicle dropdown
exports.getVehicleDropDown = async (req, res) => {
  try {
    let data = req.body;
    let matchMakeId = {};
    let matchModelId = {};
    // req.params.type = "vehicle_detail"
    let matchGenerationId = {};
    let matchEngineId = {};
    if (data.makeId != "") {
      matchMakeId = { _id: new mongoose.Types.ObjectId(data.makeId) };
    }
    if (data.modelId != "") {
      matchModelId = { _id: new mongoose.Types.ObjectId(data.modelId) };
    }
    if (data.generationId != "") {
      matchGenerationId = {
        _id: new mongoose.Types.ObjectId(data.generationId),
      };
    }
    if (data.engineId != "") {
      matchEngineId = { _id: new mongoose.Types.ObjectId(data.engineId) };
    }
    let pipeline = [
      {
        $match: {
          $and: [matchMakeId, { vehicle_type: req.params.type },{isDeleted:false}],
        },
      },
      {
        $lookup: {
          from: "models",
          localField: "_id",
          foreignField: "makeId",
          as: "models",
          pipeline: [
            {
              $match: {
                $and: [
                  matchModelId,
                  { vehicle_type: req.params.type },
                  
                  // { 'makeId': new mongoose.Types.ObjectId(data.makeId) }
                ],
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "generations",
          localField: "models._id",
          foreignField: "modelId",
          as: "generations",
          pipeline: [
            {
              $match: {
                $and: [matchGenerationId, { vehicle_type: req.params.type }],

              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "engines",
          localField: "generations._id",
          foreignField: "generationId",
          as: "engines",
          pipeline: [
            {
              $match: {
                $and: [
                  matchEngineId,
                  { vehicle_type: req.params.type }
                  // { 'makeId': new mongoose.Types.ObjectId(data.makeId) },
                  // { 'modelId': new mongoose.Types.ObjectId(data.modelId) },
                  // { 'generationId': new mongoose.Types.ObjectId(data.generationId) },
                ],
              },
            },
            {
              $group: {
                _id: "$engineType",
                engines: { $push: "$$ROOT" }
              }
            }
          ],
        },
      },
      //   {
      //     $lookup: {
      //       from: "engines",
      //       localField: "models._id",
      //       foreignField: "modelId",
      //       as: "enginesForModel",
      //       pipeline: [
      //         {
      //           $match: {
      //             $and: [
      //               matchEngineId,
      //               // { 'makeId': new mongoose.Types.ObjectId(data.makeId) },
      //               // { 'modelId': new mongoose.Types.ObjectId(data.modelId) },
      //               // { 'generationId': new mongoose.Types.ObjectId(data.generationId) },
      //             ],
      //           },
      //         },
      //       ],
      //     },
      //   },
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
                      { $ne: [data.makeId, ""] },
                      {
                        $or: [
                          { $in: ["$$modelData._id", "$generations.modelId"] }, // If engines exist, match modelId
                          { $eq: [{ $size: "$generations" }, 0] }, // If engines array is empty, allow all models
                        ],
                      },
                      //   {
                      //     $or: [
                      //     //  { $in: ["$$modelData._id", "$engines.modelId"] }, // If engines exist, match modelId
                      //      { $eq: [{ $size: "$engines" }, 0] }, // If engines array is empty, allow all models
                      //     ],
                      //   },
                    ],
                  },
                },
              },
              as: "models", // Alias for each pricebook
              in: {
                modelName: "$$models.model",
                modelId: "$$models._id",
              },
            },
          },
          generations: "$generations",
          // generations: {
          //   $map: {
          //     input: {
          //       $filter: {
          //         input: "$generations",
          //         as: "gen",
          //         cond: {
          //           $and: [
          //             { $eq: ["$$gen.makeId", "$_id"] }, // Make sure generation belongs to the current make
          //             { $ne: [data.modelId, ""] },
          //             { $ne: [data.makeId, ""] },

          //             {
          //               $or: [
          //                 { $in: ["$$gen.modelId", "$models._id"] }, // If engines exist, match modelId
          //                 { $eq: [{ $size: "$models" }, 0] }, // If engines array is empty, allow all models
          //               ],
          //             },
          //             {
          //               $or: [
          //                 { $in: ["$$gen._id", "$engines.generationId"] }, // If engines exist, match modelId
          //                 { $eq: [{ $size: "$engines" }, 0] }, // If engines array is empty, allow all models
          //               ],
          //             },
          //           ],
          //         },
          //       },
          //     },
          //     as: "generation", // Alias for each pricebook
          //     in: "$$generation",
          //   },
          // },
          // engines: {
          //   $map: {
          //     input: {
          //       $filter: {
          //         input: "$engines",
          //         as: "eng",
          //         cond: {
          //           $and: [
          //             { $eq: ["$$eng.makeId", "$_id"] }, // Make sure generation belongs to the current make
          //             { $ne: [data.modelId, ""] },
          //             { $ne: [data.makeId, ""] },
          //             //   { $ne: [data.generationId, ""] },
          //             // { $in: ["$$eng.modelId", "$models._id"] }, // Check if generation's modelId is in models array
          //             {
          //               $or: [
          //                 { $in: ["$$eng.modelId", "$models._id"] }, // If engines exist, match modelId
          //                 { $eq: [{ $size: "$models" }, 0] }, // If engines array is empty, allow all models
          //               ],
          //             },
          //             {
          //               $or: [
          //                 { $in: ["$$eng.generationId", "$generations._id"] },
          //                 { $eq: [{ $size: "$generations" }, 0] },
          //               ],
          //             },
          //           ],
          //         },
          //       },
          //     },
          //     as: "engine", // Alias for each pricebook
          //     in: "$$engine",
          //   },
          // },
          engines: "$engines"
        },
      },
    ];
    let response = await MAKE.aggregate(pipeline);
    res.send({
      code: constant.successCode,
      message: "Success!",
      result: response,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

//Get Vehicle dropdown for ori
exports.getDropDownForOri = async (req, res) => {
  try {
    let data = req.body;
    let matchMakeId = {};
    let matchModelId = {};
    // req.params.type = "original_file"

    let matchGenerationId = {};
    let matchEngineId = {};
    if (data.makeId != "") {
      matchMakeId = { _id: new mongoose.Types.ObjectId(data.makeId) };
    }
    if (data.modelId != "") {
      matchModelId = { _id: new mongoose.Types.ObjectId(data.modelId) };
    }
    if (data.generationId != "") {
      matchGenerationId = {
        _id: new mongoose.Types.ObjectId(data.generationId),
      };
    }
    if (data.engineId != "") {
      matchEngineId = { _id: new mongoose.Types.ObjectId(data.engineId) };
    }
    let pipeline = [
      {
        $match: {
          $and: [matchMakeId, { vehicle_type: "original_file" }],
        },
      },
      {
        $lookup: {
          from: "models",
          localField: "_id",
          foreignField: "makeId",
          as: "models",
          pipeline: [
            {
              $match: {
                $and: [
                  matchModelId,
                  // { 'makeId': new mongoose.Types.ObjectId(data.makeId) }
                ],
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "engines",
          localField: "models._id",
          foreignField: "modelId",
          as: "engines",
          pipeline: [
            {
              $match: {
                $and: [
                  matchEngineId,
                ],
              },
            },

          ],
        },
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
                      { $ne: [data.makeId, ""] },
                      //   {
                      //     $or: [
                      //     //  { $in: ["$$modelData._id", "$engines.modelId"] }, // If engines exist, match modelId
                      //      { $eq: [{ $size: "$engines" }, 0] }, // If engines array is empty, allow all models
                      //     ],
                      //   },
                    ],
                  },
                },
              },
              as: "models", // Alias for each pricebook
              in: {
                modelName: "$$models.model",
                modelId: "$$models._id",
              },
            },
          },

          engines: 1
        },
      },
    ];
    let response = await MAKE.aggregate(pipeline);
    res.send({
      code: constant.successCode,
      message: "Success!",
      result: response,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

//Add ECU
exports.addECU = async (req, res) => {
  try {
    let data = req.body;

    let checkECU = await ECU.findOne({ ecu: data.ecu, engineId: data.engine });
    if (checkECU) {
      res.send({
        code: constant.errorCode,
        message: "ECU already exist!",
      });
      return;
    }

    let checkMake = await MAKE.findOne({ _id: data.make });

    if (!checkMake) {
      res.send({
        code: constant.errorCode,
        message: "Invalid make is provided!",
      });
      return;
    }

    let checkModel = await MODEL.findOne({ _id: data.model });
    if (!checkModel) {
      res.send({
        code: constant.errorCode,
        message: "Invalid model is provided!",
      });
      return;
    }
    let checkGeneration = await GENERATION.findOne({ _id: data.generation });
    if (!checkGeneration) {
      res.send({
        code: constant.errorCode,
        message: "Invalid generation provided",
      });
    }

    let checkEngine = await ENGINE.findOne({ _id: data.engine });
    if (!checkEngine) {
      res.send({
        code: constant.errorCode,
        message: "Invalid engine provide!",
      });
      return;
    }

    data.engineId = checkEngine._id;
    data.generationId = checkGeneration._id;
    data.modelId = checkModel._id;
    data.makeId = checkMake._id;

    const saveData = await ECU(data).save();

    res.send({
      code: constant.successCode,
      message: "Success",
      result: saveData,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

//Get ECU
exports.getECU = async (req, res) => {
  try {
    let data = req.body;
    let ecu = await ECU.aggregate([
      {
        $match: {
          $and: [
            {
              ecu: {
                $regex: data.ecu ? data.ecu.replace(/\s+/g, " ").trim() : "",
                $options: "i",
              },
            },
            { isDeleted: false },
            { status: true },
          ],
        },
      },
      {
        $lookup: {
          from: "makes",
          localField: "makeId",
          foreignField: "_id",
          as: "makesData",
        },
      },
      {
        $lookup: {
          from: "models",
          localField: "modelId",
          foreignField: "_id",
          as: "modelData",
        },
      },
      {
        $lookup: {
          from: "generations",
          localField: "generationId",
          foreignField: "_id",
          as: "generationsData",
        },
      },
      {
        $lookup: {
          from: "engines",
          localField: "engineId",
          foreignField: "_id",
          as: "engineData",
        },
      },
      {
        $unwind: {
          path: "$makesData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$modelData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$generationsData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$engineData",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    res.send({
      code: constant.successCode,
      message: "Success!",
      result: ecu,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

//Get ENgine By id
exports.getEngineById = async (req, res) => {
  try {
    let checkEngine = await ENGINE.findOne({ _id: req.params.engineId });
    if (!checkEngine) {
      res.send({
        code: constant.errorCode,
        message: "Invalid engine id!",
      });
      return;
    }

    let query = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.engineId),
        },
      },
      {
        $lookup: {
          from: "generations",
          localField: "generationId",
          foreignField: "_id",
          as: "generationData",
        },
      },
      {
        $lookup: {
          from: "models",
          localField: "modelId",
          foreignField: "_id",
          as: "modelData",
        },
      },
      {
        $lookup: {
          from: "makes",
          localField: "makeId",
          foreignField: "_id",
          as: "makesData",
        },
      },
      {
        $unwind: {
          path: "$generationData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$modelData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$makesData",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    let response = await ENGINE.aggregate(query);

    res.send({
      code: constant.successCode,
      message: "Success!",
      result: response,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

//Get Engine details

exports.getEngineDetail = async (req, res) => {
  try {
    let data = req.body;
    let checkMake = await MAKE.findOne({ _id: data.make });
    if (!checkMake) {
      res.send({
        code: constant.errorCode,
        message: "Invalid make is provided!",
      });
      return;
    }
    let checkModel = await MODEL.findOne({ _id: data.model });
    if (!checkModel) {
      res.send({
        code: constant.errorCode,
        message: "Invalid model is provided!",
      });
      return;
    }
    let checkGeneration = await GENERATION.findOne({ _id: data.generation });
    if (!checkGeneration) {
      res.send({
        code: constant.errorCode,
        message: "Invalid generation provided",
      });
    }

    let checkEngine = await ENGINE.findOne({ _id: data.engine });
    if (!checkEngine) {
      res.send({
        code: constant.errorCode,
        message: "Invalid engine provided",
      });
    }
    let getEngine = await ENGINE.aggregate([
      {
        $match: {
          $and: [
            { _id: new mongoose.Types.ObjectId(data.engine) },
            { isDeleted: false },
            { status: true },
          ],
        },
      },
      {
        $lookup: {
          from: "models",
          localField: "modelId",
          foreignField: "_id",
          as: "modelData",
        },
      },
      {
        $lookup: {
          from: "makes",
          localField: "makeId",
          foreignField: "_id",
          as: "makeData",
        },
      },
      {
        $lookup: {
          from: "generations",
          localField: "generationId",
          foreignField: "_id",
          as: "generationData",
        },
      },
      {
        $unwind: {
          path: "$modelData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$makeData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$generationData",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    res.send({
      code: constant.successCode,
      message: "Success",
      result: getEngine,
    });
  } catch (err) {
    res.send({
      codE: constant.errorCode,
      message: err.message,
    });
  }
};

//Get User List
exports.getUserList = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.body;

    let userList = await USER.find(
      { role: "user" },
      { email: 1, firstName: 1, lastName: 1, status: 1, phone: 1, credits: 1 }
    )
      .sort({ createdAt: -1 })
      .skip(page * limit - limit)
      .limit(limit);

    res.send({
      code: constant.successCode,
      message: "Success!",
      result: userList,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

//Update User
exports.updateUserDetail = async (req, res) => {
  try {
    let userId = req.params.userId;
    let data = req.body;
    let checkUser = await USER.findOne({ _id: userId });
    if (!checkUser) {
      res.send({
        code: constant.errorCode,
        message: "Invalid user id!",
      });
      return;
    }

    // if (data.credits + checkUser.credits < 0) {
    //   res.send({
    //     code: constant.errorCode,
    //     message: "Invalid Credits",
    //   });
    //   return;
    // }

    // if (data.credits && data.credits != "") {
    //   data.credits = Number(checkUser.credits) + Number(data.credits);
    // }


    let updateUser = await USER.findByIdAndUpdate({ _id: userId }, data, {
      new: true,
    });
    if (!updateUser) {
      res.send({
        code: constant.errorCode,
        message: "Unable to update!",
      });
      return;
    }
    res.send({
      code: constant.successCode,
      message: "Success!",
      result: updateUser,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

//Upload image in S3 Bucket

//upload comment image data in claim
exports.uploadImage = async (req, res, next) => {
  try {
    imageUpload(req, res, async (err) => {
      console.log("🚀 ~ req:", req)
      let file = req.file;
      console.log("🚀 ~ file:", file)
      res.send({
        code: constant.successCode,
        message: "Success!",
        messageFile: {originalname: file.originalname, location: file.location},
      });
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};


// exports.getMakeWithId = async (req, res) => {
//   try {
//     let getMake = await 
//   } catch (err) {
//     res.send({
//       code: constant.errorCode,
//       message: err.message
//     })
//   }
// }

exports.updateMakeShow = async (req, res) => {
  try {
    let data = req.body
    let updateData = await MAKE.findOneAndUpdate({ _id: data._id }, data, { new: true })
    if(!updateData){
      res.send({
        code:constant.errorCode,
        message:"Invalid ID"
      })
    }else{
      res.send({
        code:constant.successCode,
        message:"Success",
        result:updateData
      })
    }
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message
    })
  }
}


// Admin Create Blog

exports.createBlog = async (req, res) => {
  try {
    const { title, description, file } = req.body; // file = image URL

    if (!title || !description) {
      return res.send({
        code: constant.errorCode,
        message: "Title and description are required",
      });
    }

    let saveBlog = await BLOG({
      title,
      description,
      image: file || null,  // save the uploaded image URL
      createdBy: req.adminId
    }).save();

    res.send({
      code: constant.successCode,
      message: "Blog created successfully",
      result: saveBlog
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message
    });
  }
};

// Get all blogs (admin)
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await BLOG.find({ isDeleted: false }).sort({ createdAt: -1 });

    res.send({
      code: constant.successCode,
      message: "Success",
      result: blogs
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message
    });
  }
};
// Update blog
exports.updateBlog = async (req, res) => {
  try {
    const { title, description, file } = req.body;
    const blogId = req.params.blogId;

    if (!title || !description) {
      return res.send({
        code: constant.errorCode,
        message: "Title and description are required",
      });
    }

    const updatedBlog = await BLOG.findOneAndUpdate(
      { _id: blogId, isDeleted: false },
      {
        title,
        description,
        ...(file && { image: file }) // update image only if file is provided
      },
      { new: true }
    );

    if (!updatedBlog) {
      return res.send({
        code: constant.errorCode,
        message: "Blog not found",
      });
    }

    res.send({
      code: constant.successCode,
      message: "Blog updated successfully",
      result: updatedBlog,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};


// Get blog by ID
exports.getBlogById = async (req, res) => {
  try {
    let blog = await BLOG.findOne({ _id: req.params.blogId, isDeleted: false });

    if (!blog) {
      return res.send({
        code: constant.errorCode,
        message: "Blog not found"
      });
    }

    res.send({
      code: constant.successCode,
      result: blog
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message
    });
  }
};

// Delete Blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await BLOG.findOneAndUpdate(
      { _id: req.params.blogId },
      { isDeleted: true },
      { new: true }
    );

    if (!blog) {
      return res.send({
        code: constant.errorCode,
        message: "Blog not found"
      });
    }

    res.send({
      code: constant.successCode,
      message: "Blog deleted successfully"
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message
    });
  }
};
// Public: Get all blogs for users (No token required)
