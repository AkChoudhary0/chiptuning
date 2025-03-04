
const mongoose = require("mongoose")
const Schema = mongoose.Schema

const engines = new Schema({
    engine: {
        type: String,
        default: null
    },
    generationId: {
        type: mongoose.Schema.Types.ObjectId, ref: "generations",
        default: null
    },
    modelId: {
        type: mongoose.Schema.Types.ObjectId, ref: "models",
        default: null
    },
    makeId: {
        type: mongoose.Schema.Types.ObjectId, ref: "makes",
        default: null
    },
    engineMethods: {
        type: [],
        default: []
    },
    specifications: {
        type: {},
        default: {}
    },
    vehicle_type:{
        type: String,
        default: ''
    },
    engineNumber: {
        type: String,
        default: ''
    },
    hardware_number: {
        type: String,
        default: ''
    },
    software_number: {
        type: String,
        default: ''
    },
    ecu: {
        type: String,
        default: ''
    },
    ecu_type: {
        type: String,
        default: ''
    },
    size: {
        type: String,
        default: ''
    },

    status: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })

module.exports = mongoose.model("engines", engines)