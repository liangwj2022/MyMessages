import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    username: {
        type: String
    }
});

userSchema.plugin(uniqueValidator);

const User = mongoose.model("User", userSchema);

export default User;