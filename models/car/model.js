const mongoose = require("mongoose")
const Schema = mongoose.Schema

const models = new Schema({
    model: {
        type: String,
        default: null
    },
    vehicle_type:{
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
    makeId: {
        type: mongoose.Schema.Types.ObjectId, ref: "makes",
        default: null
    }
}, { timestamps: true })

module.exports = mongoose.model("models", models)