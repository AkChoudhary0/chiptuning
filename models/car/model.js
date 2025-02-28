const mongoose = require("mongoose")
const Schema = mongoose.Schema

const models = new Schema({
    model: {
        type: String,
        default: null
    },
    makeId: {
        type: mongoose.Schema.Types.ObjectId, ref: "makes",
        default: null
    }
}, { timestamps: true })

module.exports = mongoose.model("models", models)