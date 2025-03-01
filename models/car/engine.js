
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
    makeId: {
        type: mongoose.Schema.Types.ObjectId, ref: "makes",
        default: null
    },
    modelId: {
        type: mongoose.Schema.Types.ObjectId, ref: "models",
        default: null
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