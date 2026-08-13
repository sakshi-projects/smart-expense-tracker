// const express = require("express");
// const router = express.Router();
// const Expense = require("../models/Expense");
// const Goal = require("../models/Goal");

// router.get("/goal-advice/:userId", async (req, res) => {
//   try {
//     const expenses = await Expense.find({ user: req.params.userId });
//     const goal = await Goal.findOne({ user: req.params.userId });

//     let totalExpense = 0;
//     let categoryTotals = {};

//     expenses.forEach((exp) => {
//       totalExpense += exp.amount;

//       if (!categoryTotals[exp.category]) {
//         categoryTotals[exp.category] = 0;
//       }

//       categoryTotals[exp.category] += exp.amount;
//     });

//     const months = goal.months;
//     const requiredMonthlySaving = goal.targetAmount / months;

//     const reduceAmount = requiredMonthlySaving * 0.4;

//     let suggestions = {};

//     Object.keys(categoryTotals).forEach((cat) => {
//       suggestions[cat] = Math.round(categoryTotals[cat] * 0.2);
//     });

//     res.json({
//       requiredMonthlySaving,
//       suggestions,
//     });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const Goal = require("../models/Goal");

router.get("/goal-advice/:userId", async (req, res) => {
  try {

    const expenses = await Expense.find({ user: req.params.userId });
    const goal = await Goal.find({ user: req.params.userId });

    if (!goal) {
      return res.status(404).json({
        message: "No goal found"
      });
    }

    let totalExpense = 0;
    let categoryTotals = {};

    expenses.forEach((exp) => {

      totalExpense += exp.amount;

      if (!categoryTotals[exp.category]) {
        categoryTotals[exp.category] = 0;
      }

      categoryTotals[exp.category] += exp.amount;

    });

    const months = goal.months;
    const requiredMonthlySaving = goal.amount / months;

    let suggestions = {};

    Object.keys(categoryTotals).forEach((cat) => {

      if (categoryTotals[cat] > totalExpense * 0.3) {
        suggestions[cat] = Math.round(categoryTotals[cat] * 0.25);
      } 
      else if (categoryTotals[cat] > totalExpense * 0.15) {
        suggestions[cat] = Math.round(categoryTotals[cat] * 0.15);
      } 
      else {
        suggestions[cat] = Math.round(categoryTotals[cat] * 0.05);
      }

    });

    res.json({
      requiredMonthlySaving,
      suggestions
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;