const expressJwt = require("express-jwt");
const UserService = require("../users");

module.exports = jwt;

function jwt() {
  const secret = process.env.JWT_SECRET;
  return expressJwt({ secret, algorithms: ["HS256"], isRevoked }).unless({
    path: [
      // public routes that don't require authentication
      "/users/login",
      "/users/register",
      "/users/forgotPassword",
      "/users/checkout",
      "/products/getAll",
      "/products/addProduct",
    ],
  });
}

async function isRevoked(req, payload, done) {
  const user = await UserService.getById(payload.sub);

  // revoke token if user no longer exists
  if (!user) {
    return done(null, true);
  }

  done();
}
