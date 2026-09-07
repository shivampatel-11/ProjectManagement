import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  emailVarificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from "../utils/mail.js";
import Mailgen from "mailgen";
import jwt from "jsonwebtoken"


const generateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({
      validateBeforeSave: false,
    });

    return {
      accessToken,
      refreshToken,
    };

  } catch (error) {

    throw new ApiError(
      500,
      "Something went wrong while generating access token",
    );

  }
};


const registerUser = asyncHandler(async (req, res) => {

  const {
    email,
    username,
    password,
    role,
  } = req.body;


  const existedUser = await User.findOne({
    $or: [
      { username },
      { email },
    ],
  });


  if (existedUser) {
    throw new ApiError(
      409,
      "User with email or username already exists",
      [],
    );
  }


  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });


  const {
    unHashedToken,
    hashedToken,
    tokenExpiry,
  } = user.generateTemporaryToken();


  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;


  await user.save({
    validateBeforeSave: false,
  });


  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",

    mailgenContent: emailVarificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/varify-email/${unHashedToken}`,
    ),
  });


  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );


  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering user",
    );
  }


  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        {
          user: createdUser,
        },
        "User registered successfully and verification email has been sent to your email",
      ),
    );

});

const login = asyncHandler(async (req,res)=> {
  const {email,password,username} = req.body

  if(!email){
    throw new ApiError(400, "Email is required")
  }

 const user =  await User.findOne( { email });

 if(!user){
  throw new ApiError(400, "User does not exists");
 }
  
 const isPasswordValid = user.isPasswordCorrect(password);

 if(!isPasswordValid){
  throw new ApiError(400, "Enter valid password");
 }

 const { accessToken, refreshToken } = await 
 generateAccessTokenAndRefreshTokens(user._id)




 const loggeddUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

const options = {
  httpOnly: true,
  secure: true
}



return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,{
        user: loggeddUser,
        accessToken,
        refreshToken
      },
      "User logged in successfully"
    )
  )

});

const logoutUser = asyncHandler(async (req,res)=>{

  await User.findByIdAndUpdate(
    req.user._id,{
      $set: {
        refreshToken: "",
      },

    },

    {
      new:true,
    },

  );

  const options = {
    httpOnly:true,
    secure:true
  }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
    

});

const getCurrentUser = asyncHandler(async(req,res)=> {
          return res
          .status(200)
          .json(

            new ApiResponse(
              200,
              req.user,
              "Current user fetched successfully"
            )
          );
});

const verifyEmail = asyncHandler(async(req,res)=> {
  
  const {verificationToken} = req.params
  if(!verificationToken){
    throw new ApiError(400,"emial verification token is missing")
  }

 let hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex")

      await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: {$gt: Date.now()}
      })
      
      if(!user){
        throw new ApiError(400, "Token is invalid or expired")
      }

       user.emailVerificationToken = undefined
       user.emailVerificationExpiry = undefined

        user.isEmailVerified = true
        await user.save({ validateBeforeSave: false})

        return res.status(200)
        .json(
          new ApiResponse(
            200, {
              isEmailVerified: true
            },
            "email is verified"
          )
        )

});


const resendEmailVerification = asyncHandler(async(req,res)=> {
 const user = await User.findById(req.user?._id)
 if(!user){
  throw new ApiError(404, "user does not exist")
 }
  if(user.isEmailVerified){
    throw new ApiError(409, "Email is already verified")
  }
     const {
    unHashedToken,
    hashedToken,
    tokenExpiry,
  } = user.generateTemporaryToken();


  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;


  await user.save({
    validateBeforeSave: false,
  });


  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",

    mailgenContent: emailVarificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/varify-email/${unHashedToken}`,
    ),
  });

  return res 
  .status(200)
  .json(
    new ApiResponse(
      200, 
      {},
      "Mail  has been sent to your email id"
    )
  )

});


const refreshToken = asyncHandler(async(req,res)=> {

 const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken){
    throw new ApiError(401, "Unauthorized Access")
  }
  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    await user = await User.findById(decodedToken?._id);
    if(!user){
      throw new ApiError(401, "Invalid refresh Token");
    }
    
    if(incomingRefreshToken != user?.refreshToken){

       throw new ApiError(401, " refresh Token expired ");
    }
   
    const options = {
      httpOnly: true,
      secure: true
    }
       const {accessToken,refreshToken: newRefreshToken} = await 
       generateAccessTokenAndRefreshTokens(user._id)

       user.refreshToken = newRefreshToken;
       await user.save()
       
       return res.status(200)
       .cookie("accessToken",accessToken,options)
       .cookie("refreshToken", newRefreshToken, options)
       .json(
        200,
        {accessToken, refreshToken: newRefreshToken},
        "Access token refreshed"
       )
 
  } catch (error) {

     throw new ApiError(401, " refresh Token invalid ");
  }
});


const forgetPasswordRequest = asyncHandler(async(req,res)=> {

  const {email} = req.body

  const user = await User.findOne({email})
  if(!user){
    throw new ApiError(404, "User does not exists.", [])
  }
const {unHashedToken, hashedToken, tokenExpiry} =  user.generateTemporaryToken();
user.forgetPasswordToken = hashedToken
user.forgetPasswordExpiry = tokenExpiry

await user.save({validateBeforeSave: false})

await sendEmail({
  email: user?.email,
  subject: "Password reset Request",
  mailgenContent: forgotPasswordMailgenContent(
    user.username,
    `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
  )
})

return res
.status(200)
.json(
  new ApiResponse(
    200,
    {},
    "Password reeset email has been sent on your mail id"
  )
)
});


const resetForgotPassword = asyncHandler(async(req, res)=> {

  const {resetToken} = req.params
  const {newPassword} = req.body

  let hashedToken = crypto
  .createHash("sha256")
  .update(resetToken)
  .digest("hex")
  

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry:{$gt:Date.now()}
  })


  if(!user){
    throw new ApiError(489, "Token is invalid or expired")
  }


  user.forgotPasswordExpiry = undefined
  user.forgotPasswordToken = undefined
  user.password = newPassword

  await user.save({validateBeforeSave:false})
  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      {},
      "Password reset Successfully"
    )
  )

});


const changeCurrentPassword = asyncHandler(async (req, res)=> {

  const {oldPassword, newPassword} = req.body

   const user = await User.findById(req.user?.id);

   const isPasswordValid = await user.isPasswordCorrect(oldPassword)

   if(!isPasswordValid){
    throw new ApiError(400, "Invalid old Password")
   }


   user.password = newPassword
   await user.save({validateBeforeSave: false}

    
   )






   return res
   .status(200)
   .json(
    new ApiResponse(
      200, {},
      "Password changed successfully"
    )
   );

});


// const getCurrentUser = asyncHandler(async(req,res)=> {

// });



export {
  registerUser,
  login,
  logoutUser,
  getCurrentUser, 
  verifyEmail,
  resendEmailVerification,
  refreshToken,
  forgetPasswordRequest,
  changeCurrentPassword,
  resetForgotPassword
};