import mongoose, {Schema} from "mongoose";

const postSchema = new Schema({
    title: {
        type: Boolean,
        required : true,
        index: true,
    },
    description: {
        type: String,
        required : true,
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],

}, {timestamps: true});

export const Post = mongoose.model("Post", postSchema);