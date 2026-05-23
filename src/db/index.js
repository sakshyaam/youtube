
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";                
import { connect } from "mongoose";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`); // jaha connection hunxa tesko name liney
        
    } catch (error) {
        console.log("MANGODB connection error", error); 
        process.exit(1);
        
    }
}
export default connectDB;