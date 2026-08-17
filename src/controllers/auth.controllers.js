import {User} from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import  { ApiError }  from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js";
import { emailVarificationMailgenContent, sendEmail } from "../utils/mail.js";
import Mailgen from "mailgen";

const generateAccessTokenAndRefreshTokens = async(userId) =>{
     try {
        const user = await User.FindById(userId)
      const accessToken =  user.generateAccessToken()
       const refreshToken =  user.generateRefreshToken()
     

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}

     } catch (error) {
        
        throw new ApiError(
            500,
            "Something went wrong while generating access token",
        );


     }
}



const registerUser= asyncHandler(async (req, res)=> {
     const {email, username, password, role }= req.body


      const existedUser = await User.findOne({
        $or: [{username},{email}]
     })

     if(existedUser){
        throw new ApiError(409,"User with email or username already exists", [])
     }

      const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false
     })
    const {unHashedToken, hashedToken, tokenExpiry} =
     user.generateRefreshToken();


     user.emaiVerificationToken = hashedToken
     user.emaiVerificationExpiry = tokenExpiry
    
     await user.save ({validateBeforeSave:false})

     

     await sendEmail({
      email:user?.email,
      subject: "Please verify your email",
      MailgenContent: emailVarificationMailgenContent(
         user.username,
         `${req.protocol}://${req.get("host")}/api/v1/users/varify-email${unHashedToken}`

      )
     })

     const createdUser = await User.FindById(user._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
     );
      
      if(!createdUser){
         throw new ApiError(500,
            "something while registering user"
         )
      }
 return res
       .status(201)
       .json(
         new ApiResponse(
            200,
            {
               user:createdUser},
               "user registered succcessfully and verification email had been sent your email",
         )
       )

});


export {registerUser};