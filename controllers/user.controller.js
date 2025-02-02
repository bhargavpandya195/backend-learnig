import { ApiError } from "../utils/ApiErrHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/User.Model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiRespnseHandler.js";

export const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const { userName, email, fullName, password } = req.body;
    console.log("Received email:", email);
    console.log("Request Body:", req.body);

    // Ensure all fields are provided and non-empty
    if (
      !userName?.trim() ||
      !email?.trim() ||
      !fullName?.trim() ||
      !password?.trim()
    ) {
      return next(new ApiError(400, "❗All fields are required"));
    }

    // Validate email format using regex
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return next(new ApiError(400, "📧 Email should contain '@' and a valid domain"));
    }

    // Check if user already exists (either by userName or email)
   const userByUserName = await User.findOne({ userName });
   if (userByUserName) {
     return next(new ApiError(409, "🚫 Username already exists"));
   }

   // Check if user already exists by email
   const userByEmail = await User.findOne({ email });
   if (userByEmail) {
     return next(new ApiError(409, "🚫 Email already exists"));
   }

    // Handle file upload (avatar and cover image)
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImgPath = req.files?.coverImg?.[0]?.path;

    // Check if avatar is uploaded
    if (!avatarLocalPath) {
      return next(new ApiError(400, "🖼️ Avatar is required"));
    }

    // Initialize coverImg as an empty string in case it's not provided
    let coverImg = "";

    // Check if cover image is uploaded
    if (coverImgPath) {
      coverImg = await uploadOnCloudinary(coverImgPath);
    }

    // Upload avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
      return next(new ApiError(400, "❌ Avatar upload failed"));
    }

    // Create the user with avatar and optional cover image
    const user = await User.create({
      userName: userName.toLowerCase(),
      email,
      fullName,
      password,
      avatar: avatar.url,
      coverImg: coverImg?.url || "", // If no cover image, leave it as empty string
    });

    const createUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createUser) {
      return next(
        new ApiError(500, "⚠️ Something went wrong while registering user")
      );
    }

    return res
      .status(201)
      .json(new ApiResponse(200, createUser, "✅ User registered successfully"));
  } catch (error) {
    // If any unexpected errors occur, pass to the error-handling middleware
    next(error);
  }
});
