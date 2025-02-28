const mongoose = require("mongoose")
const Schema = mongoose.Schema

const types  = new Schema({
    type:{
        type:String,
        default:null
    },
},{timestamps:true})

module.exports = mongoose.model("types",types)