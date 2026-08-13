
// const express = require("express");
// const router = express.Router();
// const Expense = require("../models/Expense");
// const Salary = require("../models/Salary");
// const Goal = require("../models/Goal"); // if you store user goals
// const verifyToken = require("../middleware/verifyToken");
// const axios = require("axios");

// router.get("/", verifyToken, async (req, res) => {
//   try {
//     // 1️⃣ Fetch data
//     const expenses = await Expense.find({ user: req.userId });
//     const salary = await Salary.findOne({ user: req.userId }).sort({ _id: -1 });
//     const goal = await Goal.findOne({ user: req.userId }).sort({ _id: -1 }); // latest goal

//     if (!salary) return res.status(400).json({ message: "Salary not set yet" });

//     const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
//     const remaining = salary.amount - totalExpense;

//     // 2️⃣ ML prediction
//     let mlPrediction = { overspending_alert: 0, saving_tips: [] };
//     if (expenses.length >= 3) {
//       const expenseAmounts = expenses.map(e => Number(e.amount));
//       const response = await axios.post("http://localhost:5000/predict-expense", {
//         expenses: expenseAmounts,
//       });
//       mlPrediction = response.data;
//     }

//     // 3️⃣ Detect highest spending category
//     const categoryTotals = expenses.reduce((acc, item) => {
//       const cat = item.category || "Other";
//       acc[cat] = (acc[cat] || 0) + Number(item.amount);
//       return acc;
//     }, {});

//     let maxCat = null;
//     let maxAmount = 0;
//     for (let cat in categoryTotals) {
//       if (categoryTotals[cat] > maxAmount) {
//         maxAmount = categoryTotals[cat];
//         maxCat = cat;
//       }
//     }

//     // 4️⃣ Goal feasibility & category reduction tips
//     // let goalTips = [];
//     // if (goal) {
//     //   const monthlySaving = Math.ceil(goal.amount / goal.months);
//     //   const possible = remaining >= monthlySaving;
//     //   let deficit = monthlySaving - remaining;

//     //   if (!possible) {
//     //     const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
//     //     for (let [cat, amt] of sortedCategories) {
//     //       if (deficit <= 0) break;
//     //       const reduceAmt = Math.min(deficit, amt * 0.3);
//     //       goalTips.push(`Reduce ${cat} by ₹${Math.round(reduceAmt)} to meet goal`);
//     //       deficit -= reduceAmt;
//     //     }
//     //     if (deficit > 0) goalTips.push("Goal is very ambitious. Consider increasing timeline or reducing goal amount.");
//     //   }

//     //   goalTips.unshift(`Monthly Saving Needed: ₹${monthlySaving}`);
//     // }
//     // 4️⃣ Goal feasibility & ML category reduction prediction
// let goalData = null;

// if (goal) {

//   const monthlySaving = Math.ceil(goal.amount / goal.months);
//   const possible = remaining >= monthlySaving;

//   let categoryAdjustments = [];

//   if (!possible) {

//     // Call Python ML model
//     const mlResponse = await axios.post("http://localhost:5000/predict-goal-adjustment", {
//       categories: categoryTotals,
//       salary: salary.amount,
//       goal_amount: goal.amount,
//       months: goal.months
//     });

//     categoryAdjustments = mlResponse.data.adjustments;
//   }

//   goalData = {
//     title: goal.title,
//     monthlySaving,
//     remaining,
//     possible,
//     category_adjustments: categoryAdjustments
//   };
// }

//     res.json({
//       salary: salary.amount,
//       totalExpense,
//       remaining,
//       overspend_category: maxCat,
//       mlPrediction,
//       // goal: goal ? { title: goal.title, possible: remaining >= Math.ceil(goal.amount / goal.months), goalTips } : null,
//       goal: goalData
//     });

//   } catch (err) {
//     console.error("Dashboard Prediction Error:", err);
//     res.status(500).json({ error: "Failed to fetch prediction" });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const Salary = require("../models/Salary");
const Goal = require("../models/Goal");
const verifyToken = require("../middleware/verifyToken");
const axios = require("axios");

router.get("/", verifyToken, async (req, res) => {
  try {

    // 1️⃣ Fetch data
    const expenses = await Expense.find({ user: req.userId });
    const salary = await Salary.findOne({ user: req.userId }).sort({ _id: -1 });
    const goal = await Goal.findOne({ user: req.userId }).sort({ _id: -1 });

    if (!salary) {
      return res.status(400).json({ message: "Salary not set yet" });
    }

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = salary.amount - totalExpense;

    // 2️⃣ ML prediction for overspending
    let mlPrediction = { overspending_alert: 0, saving_tips: [] };

    if (expenses.length >= 3) {
      try {

        const expenseAmounts = expenses.map(e => Number(e.amount));

        const response = await axios.post(
          "http://localhost:5000/predict-expense",
          { expenses: expenseAmounts }
        );

        mlPrediction = response.data;

      } catch (err) {
        console.log("ML server not available");
      }
    }

    // 3️⃣ Detect highest spending category
    const categoryTotals = expenses.reduce((acc, item) => {

      const cat = item.category ? item.category : "Other";

      acc[cat] = (acc[cat] || 0) + Number(item.amount);

      return acc;

    }, {});

    let maxCat = null;
    let maxAmount = 0;

    for (let cat in categoryTotals) {
      if (categoryTotals[cat] > maxAmount) {
        maxAmount = categoryTotals[cat];
        maxCat = cat;
      }
    }

    // 4️⃣ Goal feasibility & ML category reduction prediction
    // let goalData = null;

    // if (goal) {

    //   const monthlySaving = Math.ceil(goal.amount / goal.months);
    //   const possible = remaining >= monthlySaving;
    let goalData = null;

if (goal) {

  const monthlySaving = Math.ceil(goal.amount / goal.months);

  // Remaining after saving for goal
  const remainingAfterSaving = remaining - monthlySaving;

  const possible = remainingAfterSaving >= 0;

      let categoryAdjustments = [];

      if (!possible) {

        try {

          // const mlResponse = await axios.post(
          //   "http://localhost:5000/predict-goal-adjustment",
          //   {
          //     categories: categoryTotals,
          //     salary: salary.amount,
          //     goal_amount: goal.amount,
          //     months: goal.months
          //   }
          // );

          // categoryAdjustments = mlResponse.data.adjustments || [];
          const mlResponse = await axios.post(
  "http://localhost:5000/predict-reduction",
  {
    categories: categoryTotals
  }
);

categoryAdjustments = mlResponse.data.adjustments;
        } catch (err) {
          console.log("Goal ML prediction unavailable");
        }

      }

      goalData = {
        title: goal.title,
        monthlySaving,
        remainingAfterSaving,
        possible,
        category_adjustments: categoryAdjustments
      };

    }

    // 5️⃣ Send dashboard response
    res.json({
      salary: salary.amount,
      totalExpense,
      remaining,
      overspend_category: maxCat,
      mlPrediction,
      goal: goalData
    });

  } catch (err) {

    console.error("Dashboard Prediction Error:", err);

    res.status(500).json({
      error: "Failed to fetch prediction"
    });

  }
});

module.exports = router;