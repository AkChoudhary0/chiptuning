const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fileService = new Schema(
  {
    vehicle: {
      type: {},
      default: {},
    },
    tuning: {
      type: {},
      default: {},
    },
    file: {
      type: {},
      default: {},
    },
    optionalFile: {
      type: {},
      default: {},
    },
    tuningOptions: {
      type: [],
      default: [],
    },
    isModifiedParts: {
      type: Boolean,
      default: false,
    },
    modifiedPartsOptions: {
      type: {},
      default: {},
    },
    timeFrame: {
      type: String,
      default: "",
    },
    altitude: {
      type: String,
      default: "",
    },
    additionalInfo: {
      type: String,
      default: "",
    },
    termsAccepted: {
      type: {
        termCondition: {
          type: Boolean,
          default: false,
        },
        refundPolicy: {
          type: Boolean,
          default: false,
        },
      },
      default: {},
    },
    completion_status: {
      type: String,
      default: "Drafted",
      enum: ["Completed", "Drafted"],
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("fileService", fileService); //export the model
