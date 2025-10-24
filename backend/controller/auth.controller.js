import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import { generateTokens } from "../utils/generateTokens.js";

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body || {};
  if (!username?.trim() || !email?.trim() || !password?.trim()) {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return next(errorHandler(400, "Email already exists"));

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser);
    const { password: pass, ...userData } = newUser._doc;

    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json({ success: true, user: userData });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body || {};
  if (!email?.trim() || !password?.trim()) {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User not Found"));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(400, "Incorrect Password"));

    const { accessToken, refreshToken } = generateTokens(validUser);
    const { password: pass, ...userData } = validUser._doc;

    setAuthCookies(res, accessToken, refreshToken);
    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    next(error);
  }
};

// ✅ Google
export const google = async (req, res, next) => {
  const { email, name, profilePicture } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      user = new User({
        username:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture,
      });

      await user.save();
    }

    // ✅ Use generateTokens instead of createToken
    const { accessToken, refreshToken } = generateTokens(user);
    const { password: pass, ...userData } = user._doc;

    // ✅ Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token rotation
export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) return next(errorHandler(401, "No refresh token"));

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(errorHandler(404, "User not found"));

    // Rotate tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    setAuthCookies(res, accessToken, newRefreshToken);

    res.status(200).json({ success: true });
  } catch (error) {
    return next(errorHandler(401, "Invalid or expired refresh token"));
  }
};

// Get current user
export const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(
        errorHandler(
          401,
          "Unauthorized - User data missing after token verification"
        )
      );
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
