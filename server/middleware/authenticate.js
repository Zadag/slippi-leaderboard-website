const Users = require("../Models/Users");
const Characters = require("../Models/Characters");
const History = require("../Models/History");
const { verify } = require("jsonwebtoken");

// Check each reqeust for a valid jwt.  If no token or token is invalid
module.exports = function (req, res, next) {
  const token = req.cookies.token;
  console.log("here", token);
  if (!token) req.user = null;
  else {
    try {
      verify(token, process.env.JWT_SECRET, (err, user) => {
        console.log("user is", user);
        console.log("verify error is", err);
        req.user = user;
      });
    } catch (e) {
      console.error(e);
    }
  }

  next();
};
