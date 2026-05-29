const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // 🔥 VERY IMPORTANT

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const verifySeller = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Seller access only" });
  }

  next();
};

module.exports = { verifyToken, verifySeller };
