
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
    typeId: {
        type: mongoose.Schema.Types.ObjectId, ref: "types",
        default: null
    },
    modelId: {
        type: mongoose.Schema.Types.ObjectId, ref: "models",
        default: null
    }
}, { timestamps: true })

module.exports = mongoose.model("engines", engines)