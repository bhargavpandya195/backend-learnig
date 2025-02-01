import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const UserSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverTmg: {
      type: String,
    },
    WatchHistory: [
      {
        type: Schema.Types.ObjectId, // ✅ Fixed the issue here
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// **Password Hashing Middleware**
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// **Compare Hashed Password**
UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      id: this._id,
      name: this.fullName,
      email: this.email,
      userName: this.userName,
    },
    process.env.ACCESS_TOKEN_SECRET, // ✅ Ensure this is set in `.env`
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

UserSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET, // ✅ Ensure this is set in `.env`
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", UserSchema);
