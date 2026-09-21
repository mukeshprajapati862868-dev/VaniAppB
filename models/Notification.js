const mongoose=require("mongoose");


const notificationSchema=new mongoose.Schema({

userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
},


workerId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Worker"
},


title:String,


message:String,


type:{
    type:String,
    enum:[
        "booking",
        "payment",
        "status"
    ]
},


read:{
    type:Boolean,
    default:false
}


},
{
timestamps:true
});


module.exports =
mongoose.models.Notification ||
mongoose.model("Notification",notificationSchema);