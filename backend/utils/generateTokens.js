import jwt from "jsonwebtoken";

export const generateTokens = (user) => {
  const payload = {
    id: user._id,
    isAdmin: user.isAdmin,
    isSuperAdmin: user.isSuperAdmin,
  };

  // Short-lived access token (1 Hour)
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  // Long-lived refresh token (30 Days)
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};
