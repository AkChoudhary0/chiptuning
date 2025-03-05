
const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ecuSchema = new Schema({
    engineId: {
        type: mongoose.Schema.Types.ObjectId, ref: "engines",
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
    ecu: {
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

module.exports = mongoose.model("ecues", ecuSchema)