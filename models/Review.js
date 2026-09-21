const mongoose=require("mongoose");


const reviewSchema=new mongoose.Schema({

customerId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
},


workerId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Worker"
},


bookingId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Booking"
},


rating:{
    type:Number,
    min:1,
    max:5
},


comment:String


},
{
timestamps:true
});


module.exports =
mongoose.models.Review ||
mongoose.model("Review",reviewSchema);