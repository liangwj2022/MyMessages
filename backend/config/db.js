import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const db = "mongodb+srv://liangw27:hXskjd6dKE5rwCkG@start.hh8oi.mongodb.net/postsForAngularDB?retryWrites=true&w=majority";

const connectDB = async() => {
    try {
        await mongoose.connect(db);
        console.log("MongoDB is connected.");
    } catch (err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
}

export default connectDB;