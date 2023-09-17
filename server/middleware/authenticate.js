const Users = require("../Models/Users");
const Characters = require("../Models/Characters");
const History = require("../Models/History");
const { verify } = require("jsonwebtoken");

// Check each reqeust for a valid jwt.  If no token or token is invalid
module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("here", req.headers, authHeader);
  if (!token) req.user = null;
  else {
    try {
      verify(token, process.env.JWT_SECRET, (err, user) => {
        console.log(err);
        req.user = user;
      });
    } catch (e) {
      console.error(e);
    }
  }

  next();
};
