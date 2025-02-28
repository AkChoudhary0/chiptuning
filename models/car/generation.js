const mongoose = require("mongoose")
const Schema = mongoose.Schema

const generations = new Schema({
    generation: {
        type: String,
        default: null
    },
    typeId: {
        type: mongoose.Schema.Types.ObjectId, ref: "types",
        default: null
    },
    engineId:{
        type: mongoose.Schema.Types.ObjectId, ref: "engines",
        default: null
    }
}, { timestamps: true })

module.exports = mongoose.model("generations", generations)