import mongoose, { Schema } from "mongoose";
import brcypt from "brcypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"

const userSchema = new Schema(
    {
        avatar: {
            typeof: {
                url: String,
                localPath: String,
            },
            default: {
                url: `https://placehold.co/200x200`,
                localPath: ""
            }
        },

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true

        },

        fullName: {
            type: String,
            trim: true
        },

        Password: {
            type: String,
            required: [true, "PAssword is required"]
        },

        isEmailVarified: {
            type: Boolean,
            default: false
        },

        refreshToken: {
            type: String
        },

        forgotPasswordToken: {
            type: String
        },

        forgotPasswordExpiry: {
            type: Date
        },

        emailVarificationToken: {
            type: String
        },

        emailVarificationExpiry: {
            type: Date
        },
    },

    {
        timestamps: true
    }


)



userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()

    this.Password = await brcypt.hash(this.Password, 10)
    next()

})


userSchema.methods.isPasswordCorrect = async function (password) {
    return await brcypt.compare(password, this.password);
};



userSchema.methods.generateAccessToken = function(){
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {  expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}

userSchema.methods.generateRefreshToken = function(){
    jwt.sign(
       
        {
        _id: this._id,
 
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}


userSchema.methods.generateTemporaryToken = function () {

   const unHashedToken =  crypto.randomBytes(20).toString("hex")
   
   const hashedToken = crypto
   .createHash("sha256")
   .update(unHashedToken)
   .digest("hex")

    tokenExpiry = Date.now() + (20*60*1000) // 20min 
    return { hashedToken, hashedToken, tokenExpiry }


}




 
export const User = mongoose.models("User", userSchema);