const mongoose = require("mongoose")
const Schema = mongoose.Schema

const makes = new Schema({
    make: {
        type: String,
        default: null
    },
}, { timestamps: true })

module.exports = mongoose.model("makes", makes)