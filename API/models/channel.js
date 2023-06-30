const { Timestamp } = require("mongodb");
var mexp = require('mongoose-elasticsearch-xp');
const mongoose = require("mongoose")

const channelSchema = new mongoose.Schema({
    order:{
        type:String,
        name:{type:String, es_indexed:true},
        required:true,
        trim:true
    },
    from:{
        type:String,
        required:true,
        trim:true
    },
    to:{
      type:String,
      required:true,
      trim:true  
    },
    price:{
        type:String,
        required:true,
        trim:true
    },
    time:{
        type:String,
        required:true,
    },
    date:{
        type:String,
        required:true
    },
    duration:{
        type:String,
        required:true
    }

})
channelSchema.plugin(mexp)
const ChannelModel = mongoose.model("Channel : ", channelSchema)
module.exports = ChannelModel;