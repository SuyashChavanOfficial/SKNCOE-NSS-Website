import jwt from "jsonwebtoken";

export const generateTokens = (user) => {
  const payload = {
    id: user._id,
    isAdmin: user.isAdmin,
    isSuperAdmin: user.isSuperAdmin,
  };

  // Short-lived access token (30 min)
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30m",
  });

  // Long-lived refresh token (30 days)
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};
