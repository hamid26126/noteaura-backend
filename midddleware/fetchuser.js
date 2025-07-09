const jwt = require("jsonwebtoken");
const JWT_Secret = "Hamidisagoodb$oy";

const fetchuser = (req, res, next) => {
  console.log('Middleware reached')
  //Get the user from jwt token and add id to req object
  const token = req.header("auth-token");
  console.log('Received token:', token); // Log the token to ensure it's correct
  if (!token) {
    res.status(401).send({ error: "Please authenticate with a Valid Token" });
  }
  try {
    const data = jwt.verify(token, JWT_Secret);
    req.user = data.user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).send({ error: "Please authenticate with a Valid Token" });
  }
  console.log("Decoded user:", req.user); // Log the decoded user
};

module.exports = fetchuser;
