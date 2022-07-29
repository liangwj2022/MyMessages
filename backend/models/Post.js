import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content:{
        type: String,
        required: true
    },
    creator: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    imagePath: {
        type: String
    }
});

const Post = mongoose.model("Post", postSchema);

export default Post;