import { User } from "../models/User.Model.js";
import { ApiError } from "../utils/ApiErrHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    console.log("Extracted Token:", token); // Log the token to check its value
    console.log("Cookies:", req.cookies); // Log all cookies
console.log("Authorization Header:", req.header("Authorization")); // Log the Authorization header
console.log("Extracted Token:", token); // Log the extracted token

    if (!token) {
      return next(new ApiError(401, "❌ Unauthorized request"));
    }
    // Verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("decodedToken",decodedToken);
    

    // Find user and exclude password & refreshToken
    const user = await User.findById(decodedToken?.id).select(
      "-password -refreshToken"
    );
    console.log("user",user);
  
    

    if (!user) {
      return next(new ApiError(401, "❌ Invalid request - user not found"));
    }

    req.user = user;
    
    next(); // Proceed to the next middleware
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "❌ Token has expired"));
    }

    next(new ApiError(401, error?.message || "❌ Invalid Access Token"));
  }
});
