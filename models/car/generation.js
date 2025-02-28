const mongoose = require("mongoose")
const Schema = mongoose.Schema

const generations = new Schema({
    generation: {
        type: String,
        default: null
    },
    makeId: {
        type: mongoose.Schema.Types.ObjectId, ref: "makes",
        default: null
    },
    modelId:{
        type: mongoose.Schema.Types.ObjectId, ref: "models",
        default: null
    }
}, { timestamps: true })

module.exports = mongoose.model("generations", generations)