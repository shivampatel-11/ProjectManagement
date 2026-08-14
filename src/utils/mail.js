import { verify } from "jsonwebtoken";
import Mailgen from "mailgen";



const emailVarificationMailgenContent = (username, varificationUrl) => {
    return {
        body:{
            name:username,
            intro: "Welcome to our App! we are excited to have you on board.",

            action: {
                instruction: 
                "To verify your email please click on the follwing button",

                button: {
                    color: "#1aae5aff",
                    text:"verify your email",
                    link:  varificationUrl
                },
            },

            outro: "Need help, or have questions? Just reply to thsi email, we'd love to help.",
        },
    };
};


const forgotPasswordMailgenContent = (username, passwordResetUrl) =>{
    return{
        body:{
            name:username,
            intro: "We got a request to reset the password of your account",

            action: {
                instruction: 
                "To reset your password click on the follwoing button or link",

                button: {
                    color: "rgb(236, 71, 34)",
                    text:"Reset password",
                    link:  passwordResetUrl,
                },
            },

            outro: "Need help, or have questions? Just reply to thsi email, we'd love to help.",
        },
    };
};


export {
      emailVarificationMailgenContent, 
      forgotPasswordMailgenContent
}
