const mongoose = require("mongoose")
const Schema = mongoose.Schema

const models = new Schema({
    model: {
        type: String,
        default: null
    },
    typeId: {
        type: mongoose.Schema.Types.ObjectId, ref: "types",
        default: null
    }
}, { timestamps: true })

module.exports = mongoose.model("models", models)