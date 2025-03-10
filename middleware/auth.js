const jwt = require("jsonwebtoken");
const { Users } = require("../models/Users");

const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized." });

  try {
    const verified = jwt.verify(token, process.env.EMAIL_PASS);
    const user = await Users.findById(verified.userId);
    if (!user || user.status !== "active") {
      return res.status(401).json({ error: "Unauthorized. Account inactive." });
    }

    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ error: "Forbidden. Admins only." });
  }
};

const isAgent = (req, res, next) => {
  if (req.user && req.user.role === "agent") {
    next();
  } else {
    return res.status(403).json({ error: "Forbidden. Agents only." });
  }
};

module.exports = { verifyToken, isAdmin, isAgent };
