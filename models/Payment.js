const mongoose=require("mongoose");


const paymentSchema=new mongoose.Schema({

    bookingId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Booking",
        required:true
    },


    workerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Worker",
        required:true
    },


    amount:{
        type:Number,
        default:0
    },


    commission:{
        type:Number,
        default:0
    },


    workerAmount:{
        type:Number,
        default:0
    },


    status:{
        type:String,
        enum:[
            "pending",
            "paid"
        ],
        default:"pending"
    }


},
{
timestamps:true
});


module.exports =
mongoose.models.Payment ||
mongoose.model("Payment",paymentSchema);