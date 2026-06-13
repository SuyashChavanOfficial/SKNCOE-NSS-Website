import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import { generateTokens } from "../utils/generateTokens.js";
import { MESSAGES } from "../constants/messages.js";

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

export const signup = async (req, res) => {
  const { name, username, email, password } = req.body || {};
  const existingUser = await User.findOne({ email });
  if (existingUser) throw errorHandler(400, MESSAGES.AUTH.EMAIL_EXISTS);

  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({
    name: name || username,
    username,
    email,
    password: hashedPassword
  });
  await newUser.save();

  const { accessToken, refreshToken } = generateTokens(newUser);
  const { password: pass, ...userData } = newUser._doc;
  setAuthCookies(res, accessToken, refreshToken);
  res.status(201).json({ success: true, user: userData });
};

export const signin = async (req, res) => {
  const { email, password } = req.body || {};
  const validUser = await User.findOne({ email, isDeleted: { $ne: true } });
  if (!validUser) throw errorHandler(404, MESSAGES.AUTH.USER_NOT_FOUND);

  const validPassword = bcryptjs.compareSync(password, validUser.password);
  if (!validPassword) throw errorHandler(400, MESSAGES.AUTH.INCORRECT_PASSWORD);

  const { accessToken, refreshToken } = generateTokens(validUser);
  const { password: pass, ...userData } = validUser._doc;
  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({ success: true, user: userData });
};

// google login
export const google = async (req, res) => {
  const { email, name, profilePicture } = req.body;

  let user = await User.findOne({ email, isDeleted: { $ne: true } });
  if (!user) {
    const generatedPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);
    const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

    user = new User({
      name,
      username:
        name.toLowerCase().split(" ").join("") +
        Math.random().toString(9).slice(-4),
      email,
      password: hashedPassword,
      profilePicture,
    });

    await user.save();
  }

  const { accessToken, refreshToken } = generateTokens(user);
  const { password: pass, ...userData } = user._doc;

  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    user: userData,
  });
};

export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) throw errorHandler(401, MESSAGES.AUTH.NO_REFRESH_TOKEN);

  // Verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findOne({ _id: decoded.id, isDeleted: { $ne: true } });
  if (!user) throw errorHandler(404, MESSAGES.AUTH.USER_NOT_FOUND);

  // Rotate tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
  setAuthCookies(res, accessToken, newRefreshToken);
  res.status(200).json({ success: true });
};

export const getCurrentUser = async (req, res) => {
  if (!req.user || !req.user.id) {
    throw errorHandler(
      401,
      MESSAGES.AUTH.UNAUTHORIZED
    );
  }
  const user = await User.findOne({ _id: req.user.id, isDeleted: { $ne: true } }).select("-password");
  if (!user) throw errorHandler(404, MESSAGES.AUTH.USER_NOT_FOUND);
  res.status(200).json({ success: true, user });
};
