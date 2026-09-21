const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(

  {

    name: {

      type: String,

      required: true,

      trim: true

    },


    email: {

      type: String,

      required: true,

      unique: true,

      lowercase: true,

      trim: true

    },


    phone: {

      type: String,

      required: true,

      trim: true

    },


    passwordHash: {

      type: String,

      required: true

    },



    refreshTokens: [

      {

        tokenHash: String,

        createdAt: {

          type: Date,

          default: Date.now

        }

      }

    ],



    passwordResetToken: String,


    passwordResetExpires: Date,



    role: {

      type: String,

      enum: [

        "customer",

        "admin"

      ],

      default: "customer"

    },



    status: {

      type: String,

      enum: [

        "active",

        "blocked"

      ],

      default: "active"

    },



    addresses: [

      {

        houseNo: String,

        landmark: String,

        street: String,

        city: String,

        state: String,

        pincode: String,


        isDefault: {

          type: Boolean,

          default: false

        }

      }

    ]


  },

  {

    timestamps: true

  });



module.exports =

  mongoose.models.User ||

  mongoose.model("User", userSchema);
