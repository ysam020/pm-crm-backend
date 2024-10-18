import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/api/verify-user", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(200).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
});

export default router;
