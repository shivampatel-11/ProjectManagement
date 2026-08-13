import mongoose, { Schema } from "mongoose";
import brcypt from "brcypt";

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


 
export const User = mongoose.models("User", userSchema);