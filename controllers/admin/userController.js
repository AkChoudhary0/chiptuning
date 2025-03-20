const mongoose = require("mongoose");
const ECU = require("../../models/car/ecu");
const FILESERVICE = require("../../models/user/fileService");
const ENGINE = require("../../models/car/engine");
const GENERATION = require("../../models/car/generation");
const MAKE = require("../../models/car/make");
const MODEL = require("../../models/car/model");
const constant = require("../../config/constant");
const { response } = require("express");

//Get Vehicle dropdown
exports.getVehicleDropDown = async (req, res) => {
  try {
    let data = req.body;
    let matchMakeId = {};
    let matchModelId = {};
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
          $and: [matchMakeId, { vehicle_type: req.params.type }],
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
          from: "generations",
          localField: "models._id",
          foreignField: "modelId",
          as: "generations",
          pipeline: [
            {
              $match: {
                $and: [matchGenerationId],
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
                  // { 'makeId': new mongoose.Types.ObjectId(data.makeId) },
                  // { 'modelId': new mongoose.Types.ObjectId(data.modelId) },
                  // { 'generationId': new mongoose.Types.ObjectId(data.generationId) },
                ],
              },
            },
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
          generations: {
            $map: {
              input: {
                $filter: {
                  input: "$generations",
                  as: "gen",
                  cond: {
                    $and: [
                      { $eq: ["$$gen.makeId", "$_id"] }, // Make sure generation belongs to the current make
                      { $ne: [data.modelId, ""] },
                      { $ne: [data.makeId, ""] },

                      {
                        $or: [
                          { $in: ["$$gen.modelId", "$models._id"] }, // If engines exist, match modelId
                          { $eq: [{ $size: "$models" }, 0] }, // If engines array is empty, allow all models
                        ],
                      },
                      {
                        $or: [
                          { $in: ["$$gen._id", "$engines.generationId"] }, // If engines exist, match modelId
                          { $eq: [{ $size: "$engines" }, 0] }, // If engines array is empty, allow all models
                        ],
                      },
                    ],
                  },
                },
              },
              as: "generation", // Alias for each pricebook
              in: "$$generation",
            },
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
                      { $ne: [data.modelId, ""] },
                      { $ne: [data.makeId, ""] },
                      //   { $ne: [data.generationId, ""] },
                      // { $in: ["$$eng.modelId", "$models._id"] }, // Check if generation's modelId is in models array
                      {
                        $or: [
                          { $in: ["$$eng.modelId", "$models._id"] }, // If engines exist, match modelId
                          { $eq: [{ $size: "$models" }, 0] }, // If engines array is empty, allow all models
                        ],
                      },
                      {
                        $or: [
                          { $in: ["$$eng.generationId", "$generations._id"] },
                          { $eq: [{ $size: "$generations" }, 0] },
                        ],
                      },
                    ],
                  },
                },
              },
              as: "engine", // Alias for each pricebook
              in: "$$engine",
            },
          },
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

//Get ECU Detail
exports.getECUDetail = async (req, res) => {
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

    let ecuDetail = await ECU.find({
      makeId: checkMake._id,
      modelId: checkModel._id,
      generationId: checkGeneration._id,
      engineId: checkEngine._id,
    });

    res.send({
      code: constant.successCode,
      message: "Success!",
      result: ecuDetail,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

// Save File Service Form

exports.saveFileServiceForm = async (req, res) => {
  try {
    let data = req.body;
    let result;
    let option = { new: true };
    if (data.serviceId != "" && data.serviceId) {
      result = await FILESERVICE.findOneAndUpdate(
        { _id: data.serviceId },
        data,
        option
      );
    } else {
      result = await FILESERVICE(data).save();
    }
    res.send({
      code: constant.successCode,
      message: "Success!",
      result,
    });
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    });
  }
};

exports.getServicerForms = async (req, res) => {
  try {
    let data = req.body
    let getData = await FILESERVICE.aggregate([
      {
        $match: {
          $and: [
            { completion_status: req.params.status },
            { isDeleted: false }
          ]
        }
      }
    ])
    if (!getData) {
      re.send({
        code: constant.errorCode,
        message: "No Data Found",
      })
    } else {
      res.send({
        code: constant.successCode,
        message: "Success!",
        result: getData
      })
    }
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message,
    })
  }
}

exports.deleteServiceForm = async (req, res) => {
  try {
    let checkId = await FILESERVICE.findOne({ _id: req.params.id, isDeleted: false })
    if (!checkId) {
      response.send({
        code: constant.errorCode,
        message: "Invalid ID"
      })
      return
    }
    let deleteForm = await FILESERVICE.findOneAndUpdate({ _id: req.params.id }, { isDeleted: true }, { new: true })
    if (!deleteForm) {
      res.send({
        code: constant.errorCode,
        message: "Unable to delete the data"
      })
    } else {
      res.send({
        code: constant.successCode,
        messsage: "Successfully deleted "
      })
    }
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message
    })
  }
}

exports.getServicerFormById = async (req, res) => {
  try {
    let getData = await FILESERVICE.findOne({ _id: req.params.id })
    if (!getData) {
      res.send({
        code: constant.errorCode,
        message: "Unable to find the data"
      })
      return
    }
    res.send({
      code: constant.successCode,
      message: "Success",
      result: getData
    })
  } catch (err) {
    res.send({
      code: constant.errorCode,
      message: err.message
    })
  }
}