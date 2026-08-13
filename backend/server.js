require("dotenv").config();
const express = require("express");
const app = express();
const runML = require("./utils/runML");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const PDFDocument = require("pdfkit");

const User = require("./models/User");
const Salary = require("./models/Salary");
const Expense = require("./models/Expense");
const Goal = require("./models/Goal");
const mlRoutes = require("./routes/mlRoutes");

const categorizeExpense = require("./utils/categorizeExpense");
const mlPredictionRoute = require("./routes/ml-prediction");
app.use("/ml-prediction", mlPredictionRoute);
const goalRoutes = require("./routes/goals");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use("/api", mlRoutes);
app.use("/api", goalRoutes);

/* ================= DB CONNECT ================= */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("MongoDB Error ❌", err));

/* ================= TOKEN VERIFY ================= */
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

/* ================= REGISTER ================= */

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error registering user" });
  }
});

/* ================= LOGIN ================= */

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
  token,
  user: {
    _id: user._id,
    name: user.name,
    email: user.email
  }
});

  } catch (err) {
    res.status(500).json({ message: "Error logging in" });
  }
});

/* ================= ADD EXPENSE ================= */

app.post("/expenses", verifyToken, async (req, res) => {
  try {
    const { title, amount } = req.body;

    const category = categorizeExpense(title);

    const expense = new Expense({
      title,
      amount,
      category,
      user: req.userId,
    });

    await expense.save();

    res.status(201).json(expense);

  } catch (err) {
    res.status(500).json({ message: "Error saving expense" });
  }
});

/* ================= UPDATE EXPENSE ================= */

app.put("/expenses/:id", verifyToken, async (req, res) => {
  try {
    const { title, amount } = req.body;

    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, amount },
      { new: true }
    );

    res.json(updatedExpense);
  } catch (err) {
    res.status(500).json({ message: "Error updating expense" });
  }
});

/* ================= GET EXPENSES ================= */

app.get("/expenses", verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId }).sort({ _id: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching expenses" });
  }
});

/* ================= DELETE EXPENSE ================= */

app.delete("/expenses/:id", verifyToken, async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting expense" });
  }
});

/* ================= SET SALARY ================= */

app.post("/salary", verifyToken, async (req, res) => {
  try {
    const { amount, month } = req.body;

    const salary = new Salary({
      amount,
      month,
      user: req.userId,
    });

    await salary.save();

    res.status(201).json(salary);

  } catch (err) {
    res.status(500).json({ message: "Error saving salary" });
  }
});

/* ================= DASHBOARD SUMMARY ================= */

app.get("/dashboard-summary", verifyToken, async (req, res) => {
  try {
    const salary = await Salary.findOne({ user: req.userId }).sort({ _id: -1 });
    const expenses = await Expense.find({ user: req.userId });

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = salary ? salary.amount - totalExpense : 0;

    res.json({
      salary: salary ? salary.amount : 0,
      totalExpense,
      remaining,
    });

  } catch (err) {
    res.status(500).json({ message: "Error loading dashboard" });
  }
});



app.post("/set-goal", verifyToken, async (req, res) => {
  try {
    const { title, amount, months } = req.body;

    const goalAmount = Number(amount);
    const goalMonths = Number(months);

    const salary = await Salary.findOne({ user: req.userId }).sort({ _id: -1 });
    const expenses = await Expense.find({ user: req.userId });

    if (!salary) {
      return res.status(400).json({ message: "Salary not set yet" });
    }

    const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const remaining = salary.amount - totalExpense;

    const monthlySaving = Math.ceil(goalAmount / goalMonths);
    const possible = remaining >= monthlySaving;

    const deficit = Math.max(monthlySaving - remaining, 0);

    let category_adjustments = [];

    if (!possible && totalExpense > 0) {
      const categoryTotals = expenses.reduce((acc, item) => {
        const cat = item.category || "Other";
        acc[cat] = (acc[cat] || 0) + Number(item.amount);
        return acc;
      }, {});

      const sorted = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);

      category_adjustments = sorted.slice(0, 2).map(([cat, val]) => ({
        category: cat,
        amount: Math.ceil(deficit * (val / totalExpense)),
      }));
    }

    let suggestedMonths = goalMonths;

    if (!possible && remaining > 0) {
      suggestedMonths = Math.ceil(goalAmount / remaining);
    }

    const goalTips = possible
      ? ["Great! Stay consistent with savings."]
      : ["Reduce unnecessary expenses", "Increase saving duration"];
    console.log({
  monthlySaving,
  remaining,
  deficit,
  category_adjustments,
  suggestedMonths
});
    res.json({
      goal: title,
      monthlySaving,
      remaining,
      possible,
      category_adjustments,
      suggestedMonths,
      deficit,
      goalTips,
    });

  } catch (err) {
    console.log("Goal Error:", err);
    res.status(500).json({ message: "Goal calculation failed" });
  }
});



/* ================= EXPORT PDF ================= */


const axios = require("axios");

// app.get("/ml-prediction", verifyToken, async (req, res) => {
// console.log("ML API HIT ✅");

//   try {

//     const expenses = await Expense.find({ user: req.userId });
//     console.log("Expenses:", expenses);
//     if (expenses.length < 3) {
//       return res.json({
//         overspending_alert: 0,
//         message: "Not enough data for AI prediction yet"
//       });
//     }

//     const values = expenses.map(e => e.amount);

//     const response = await axios.post("http://localhost:5000/predict-expense", {
//       expenses: values
//     });

//     res.json(response.data);

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({message:"ML prediction error"});
//   }

// });

app.get("/ml-prediction", verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId });

    const salary = await Salary.findOne({ user: req.userId }).sort({ _id: -1 });

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    let tips = [];
    let overspending = 0;

    // ❗ IF NO SALARY
    if (!salary) {
      return res.json({
        overspending_alert: 0,
        saving_tips: ["⚠ Please enter your salary first"]
      });
    }

    // ✅ OVESPENDING CHECK
    if (totalExpense > salary.amount) {
      overspending = 1;
      tips.push("⚠ You are overspending! Expenses exceeded your salary.");
    } else {
      tips.push("✅ Your spending is under control");
    }

    // CATEGORY TOTALS
    const categoryTotals = expenses.reduce((acc, item) => {
      const cat = item.category || "Other";
      acc[cat] = (acc[cat] || 0) + Number(item.amount);
      return acc;
    }, {});

    if ((categoryTotals["Food 🍔"] || 0) > salary.amount * 0.25) {
      tips.push("Reduce food delivery expenses");
    }

    if ((categoryTotals["Shopping 🛍"] || 0) > salary.amount * 0.3) {
      tips.push("Limit shopping expenses");
    }

    if ((salary.amount - totalExpense) < salary.amount * 0.2) {
      tips.push("Try saving at least 20% of your income");
    }

    // ML CALL (SAFE)
    let mlTips = [];
    try {
      const values = expenses.map(e => e.amount);

      const response = await axios.post("http://localhost:5000/predict-expense", {
        expenses: values
      });

      mlTips = response.data.saving_tips || [];
    } catch (err) {
      console.log("ML failed");
    }

    // ✅ ALWAYS SEND MESSAGE
    res.json({
      overspending_alert: overspending,
      saving_tips: [...new Set([...tips, ...mlTips])]
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      overspending_alert: 0,
      saving_tips: ["Server error, please try again"]
    });
  }
});

app.get("/financial-health", verifyToken, async (req, res) => {
  try {
    const salary = await Salary.findOne({ user: req.userId }).sort({ _id: -1 });
    const expenses = await Expense.find({ user: req.userId });
    const goal = await Goal.findOne({ user: req.userId }).sort({ _id: -1 });

    if (!salary) return res.status(400).json({ message: "Salary not set" });

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = salary.amount - totalExpense;

    // 1. Savings Ratio
    const savingsRatio = Math.max((remaining / salary.amount) * 100, 0);

    // 2. Category Penalty
    const categoryTotals = expenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
      return acc;
    }, {});
    const overspendRatio = Object.values(categoryTotals)
      .reduce((acc, val) => acc + (val / salary.amount) * 100, 0);
    const categoryScore = Math.min(overspendRatio, 100);

    // 3. Goal Penalty
    let goalPenalty = 0;
    if (goal) {
      const monthlySaving = Math.ceil(goal.amount / goal.months);
      if (remaining < monthlySaving) {
        goalPenalty = ((monthlySaving - remaining) / monthlySaving) * 100;
      }
    }

    const healthScore = Math.round(
      (savingsRatio * 0.5) + ((100 - categoryScore) * 0.3) + ((100 - goalPenalty) * 0.2)
    );

    let status = "";
    if (healthScore >= 80) status = "Excellent";
    else if (healthScore >= 60) status = "Good";
    else if (healthScore >= 40) status = "Needs Improvement";
    else status = "Poor";

    res.json({ healthScore, status });

  } catch (err) {
    console.log("Financial Health Error:", err);
    res.status(500).json({ message: "Failed to calculate financial health" });
  }
});


/* ================= START SERVER ================= */

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});