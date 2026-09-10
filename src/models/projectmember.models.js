import mongoose, { Schema } from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constant.js";
import { Project } from "./project.models.js";


const projectMemberSchema =  new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required:true
    },

    role: {
        type:String,
        enum: AvailableUserRole,
        default: UserRolesEnum.MEMBER
    }

},{timestamps})

export const ProjectMember = mongoose.model("ProjectMember",projectMemberSchema);