import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    Credential : true
}));

//accept data
app.use(express.json(
    {
        limit : "16kb"
    }
));
// handles data coming through url
app.use(express.urlencoded({
    extended : true
}))

app.use(express.static("public"))
app.use(cookieParser())


//routes Import

import userRouter from './routes/user.routes.js'

//routes declaration
//prefix http://localhost:8000/api/v1/users calls user.routes.js and becomes
//http://localhost:8000/api/users/register

app.use("/api/v1/users", userRouter)




export default app;