import { ApiError } from "../utils/ApiErrHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/User.Model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiRespnseHandler.js";

//Generate Access Token
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Ensure the functions are awaited
    const accessToken = user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken(); // ✅ Make sure we await this if it's async

    user.refreshToken = refreshToken; // ✅ Assign the resolved refreshToken
    await user.save({ validateBeforeSave: false }); // ✅ Ensure the save operation is awaited

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("🔥 Server Error:", error.message || error);
    // Now throwing the error to be caught by your error handler middleware
    throw new ApiError(500, "🚨 Server error occurred. Please try again later.");
  }
};

// register the user
const registerUser = asyncHandler(async (req, res, next) => {
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
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return next(
        new ApiError(400, "📧 Email should contain '@' and a valid domain")
      );
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
      .json(
        new ApiResponse(200, createUser, "✅ User registered successfully")
      );
  } catch (error) {
    console.error("🔥 Server Error:", error.message || error);
    next(
      new ApiError(500, "🚨 Server error occurred. Please try again later.")
    );
  }
});
//login the user
const loginUser = asyncHandler(async (req, res, next) => {
  const { userName, email, password } = req.body;
  console.log("Received login request:", req.body);


  // Ensure either username or email is provided
  if (!userName?.trim() && !email?.trim()) {
    return next(new ApiError(400, "❗ Either Username or Email is required"));
  }

  // Find user by username OR email
  const user = await User.findOne({
    $or: [
      { userName: userName?.toLowerCase() },
      { email: email?.toLowerCase() }
    ],
  });
  console.log("user",user);
  

  if (!user) {
    return next(new ApiError(404, "❗ User does not exist"));
  }

  // Validate password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    return next(new ApiError(401, "❌ Incorrect password"));
  }
   const accessToken = await user.generateAccessToken(user._id);  // Await the promise
  const refreshToken = await user.generateRefreshToken(user._id);  // Await the promise


  console.log("refreshToken", refreshToken);
  console.log("accessToken",accessToken);
  

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken,
      },
      "user logged in successfully"
    )
    );
});

//logout the user
const logoutUser = asyncHandler(async (req, res, next) => { 
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined, // Fixed spelling
    }
  }, { new: true }); // Moved outside the update object
  
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options) // Fixed `clearCookies` to `clearCookie`
    .clearCookie("refreshToken", options) // Fixed `clearCookies` to `clearCookie`
    .json(
      new ApiResponse(200, {}, "User logged out successfully")
    );
});

export { registerUser, loginUser,logoutUser};
