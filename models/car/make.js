const mongoose = require("mongoose")
const Schema = mongoose.Schema

const makes = new Schema({
    make: {
        type: String,
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

module.exports = mongoose.model("makes", makes)