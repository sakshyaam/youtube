//require('dotenv').config({path: './env'});     // env variables -> jati chado application load hos -> teti chado env jata tadai available hos -> sable access pawos
//more optimized way of doing this
import dotenv from "dotenv";


import mongoose from "mongoose";
import {DB_NAME} from "./constants.js";
import connectDB from "./db/index.js";
import app from "./app.js";
  

// async returns promise ->resolve and reject
connectDB()
.then(() =>{
    app.listen(process.env.PORT || 8000, ()=>
    {
        console.log(`Server is listening : ${process.env.PORT}`)
    }); 
})
.catch( (err) =>{
    console.log("MONGODB CONNECTION FAILED")
})




















// import express from "express";
// const express = require('express');
// const app = express();
// ;( async () =>{

//     try {
//         await mongoose.coneect(`${process.env.MANGODB_URI}/${DB_NAME}`);
//         //database connected but app not listening
//         app.on("ERROR", (error) => {
//             console.log("Error", error);
//             throw error;
//         })

//         app.listen(process.env.PORT, () => {
//             console.log(`APp is listening on port ${process.env.PORT}`);
//         })
//     } catch (error) {
//         console.log("ERROR : ", error)
//     }


// })() //immediatley executable function
