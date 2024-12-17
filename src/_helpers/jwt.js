const { expressjwt } = require("express-jwt");
const UserService = require("../users");

module.exports = jwt;

function jwt() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined. Check your environment variables.");
  }

  const publicPaths = [
    "/users/login",
    "/users/googleLogin",
    "/users/register",
    "/users/forgotPassword",
    "/users/resetPassword",
    "/users/checkout",
    "/keepa/getChartData",
    /^\/uploads\/.*/,
  ];

  return expressjwt({
    secret,
    algorithms: ["HS256"],
    isRevoked,
  }).unless({
    path: publicPaths,
  });
}

async function isRevoked(req, token) {
  try {
    const user = await UserService.getById(token.payload.sub);

    // Revoke token if user no longer exists
    if (!user) {
      return true; // Token is revoked
    }

    return false; // Token is valid
  } catch (error) {
    console.error("Error in isRevoked:", error);
    throw new Error("Error checking token revocation");
  }
}
