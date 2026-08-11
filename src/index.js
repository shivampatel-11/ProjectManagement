import dotenv from "dotenv"
import app from "./app.js"
import connectDB from "./db/index.js";



dotenv.config({
    path: "./.env",
});







const port = process.env.Port || 3000;

connectDB()
    .then( ()=>{
        app.listen(port, () => {
    console.log(`server is running on https://localhost:${port}`)
})
    })
    .catch((err)=>{
        console.log("mongodb connection error",err)
        process.exit(1)
    })


