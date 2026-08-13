
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Goal = require("../models/Goal");

/* ================= VERIFY TOKEN ================= */

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized - No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
}

/* ================= ADD GOAL ================= */

router.post("/add-goal", verifyToken, async (req, res) => {
  try {
    console.log("User from token:", req.userId);
    const { title, amount, months } = req.body;

    const goal = new Goal({
      title,
      amount,
      months,
      user: req.userId   // ✅ Required field
    });

    await goal.save();

    res.status(201).json(goal);

  } catch (error) {
    console.log("Add Goal Error:", error);
    res.status(500).json({ message: "Goal not saved" });
  }
});

/* ================= GET USER GOALS ================= */

router.get("/goals/:userId", verifyToken, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.userId }).sort({ _id: -1 });

    res.json(goals);

  } catch (error) {
    console.log("Goal Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch goals" });
  }
});

/* ================= DELETE GOAL ================= */

router.delete("/goal/:id", verifyToken, async (req, res) => {
  try {
    await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    res.json({ message: "Goal deleted" });

  } catch (error) {
    console.log("Delete Goal Error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
});

/* ================= EDIT GOAL ================= */

router.put("/goal/:id", verifyToken, async (req, res) => {
  try {
    const { title, amount, months } = req.body;

    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, amount, months },
      { new: true }
    );

    res.json(updatedGoal);

  } catch (error) {
    console.log("Update Goal Error:", error);
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;