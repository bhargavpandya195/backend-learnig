import { ApiError } from "../utils/ApiErrHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/User.Model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import {ApiResponse} from "../utils/ApiRespnseHandler.js";

export const registerUser = asyncHandler(async (req, res) => {
  try {
    const { userName, email, fullName, password } = req.body;
    console.log("email", email);

    if (
      [userName, email, fullName, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      // Handle the case when any of the fields is empty
      throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists (either by userName or email)
    const existedUser = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (existedUser) {
      throw new ApiError(
        409,
        "User with this email or username already exists"
      );
    }

    // Handle file upload (avatar and cover image)
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImgPath = req.files?.coverImg?.[0]?.path;

    // Check if avatar is uploaded
    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImg = await uploadOnCloudinary(coverImgPath); // Fix here

    if (!avatar) {
      throw new ApiError(400, "Avatar is required");
    }

    const user = await User.Create({
      userName: userName.toLowerCase(),
      email,
      fullName,
      password,
      avatar: avatar.url,
      coverImg: coverImg?.url || "",
    });

    const createUser = await User.findById(user._id).select(
      "-password -refreshToken"
    )

    if (!createUser) {
      throw new ApiError(500, "something went wrong  while registering user");
    }

    return res.status(201).json(
     new ApiResponse(200,createUser, "User registered successfully")
    )
    // Create a new user
  } catch (error) {
    res.status(500).json({ message: "An error occurred during registration" });
  }
});
