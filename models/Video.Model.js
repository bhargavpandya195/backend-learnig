import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Define the Video schema
const VideoSchema = new Schema(
  {
    videoFile: {
      type: String, // Assuming this is a URL or path to the video file (e.g., Cloudinary URL)
      required: true,
    },
    ThumbNail: {
      type: String, // URL or path for the video thumbnail
      required: true,
    },
    Title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // Duration of the video in seconds
      required: true,
    },
    views: {
      type: Number,
      default: 0, // Default value for views is 0
    },
    ispublished: {
      type: Boolean,
      default: true, // Default value is true, meaning the video is published by default
    },
    owner: {
        type: Schema.Types.ObjectId, // Reference to the User model
        ref: "User", // Associates the Video with the User model
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

VideoSchema.plugin(mongooseAggregatePaginate);

// Export the model
export const Video = mongoose.model("Video", VideoSchema);
