
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import ExpenseSection from "../components/ExpenseSection";
import GoalSection from "../components/GoalSection";
import GoalAnalysis from "../components/GoalAnalysis";
import SmartTips from "../components/SmartTips";
import SummaryCards from "../components/SummaryCards";
import ExpenseChart from "../components/ExpenseChart";
function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const defaultTips = [
    "Track your expenses weekly to control unnecessary spending.",
    "Reduce spending on food delivery and entertainment to save faster.",
    "If you cannot save the exact amount every month, save more in low-expense months.",
    "Set a smaller monthly saving target and increase it gradually.",
    "Avoid impulse purchases and focus on goal-based spending.",
  ];
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [editId, setEditId] = useState(null);
  const [goals, setGoals] = useState([]);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalMonths, setGoalMonths] = useState("");
  const [goalPredictions, setGoalPredictions] = useState([]);
  const [oldGoalTitle, setOldGoalTitle] = useState("");
  const [editGoalId, setEditGoalId] = useState(null);
  const [months, setMonths] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [activeTab, setActiveTab] = useState("expenses");
  useEffect(() => {
  setPrediction({
    saving_tips: [
      "Reduce food delivery expenses",
      "Avoid unnecessary subscriptions",
      "Track daily spending for better control"
    ]
  });
}, []);
  const [overspendCategory, setOverspendCategory] = useState(null);

  const [summary, setSummary] = useState({
    salary: 0,
    totalExpense: 0,
    remaining: 0,
  });
  const [salaryInput, setSalaryInput] = useState(summary.salary || 0);

  // Function to update salary in backend
  const handleSalaryUpdate = async () => {
    if (!salaryInput) return;

    try {
      await API.post(
        "/salary",
        { amount: Number(salaryInput), month: new Date().getMonth() + 1 },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchSummary(); // refresh summary
    } catch (err) {
      console.log("Salary update error:", err);
    }
  };
  // Calculate category data for PieChart
  const categoryData = Object.values(
    expenses.reduce((acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) {
        acc[category] = { name: category, value: 0 };
      }
      acc[category].value += Number(item.amount);
      return acc;
    }, {}),
  );

  const COLORS = ["#8b5cf6", "#ec4899", "#22c55e", "#f59e0b", "#3b82f6"];

  /* ================= FETCH EXPENSES ================= */
  const fetchExpenses = async () => {
    try {
      const res = await API.get("/expenses");
      const updatedExpenses = res.data.map((item) => ({
        ...item,
        category: detectCategory(item.title),
      }));
      setExpenses(updatedExpenses);
    } catch (err) {
      console.log("Fetch expenses error:", err);
    }
  };

  /* ================= FETCH SUMMARY ================= */
  const fetchSummary = async () => {
    try {
      const res = await API.get("/dashboard-summary");
      setSummary(res.data);
    } catch (err) {
      console.log("Summary error:", err);
    }
  };

  const fetchMLPrediction = async () => {
  try {
    const res = await API.get("/ml-prediction", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    console.log("ML Prediction:", res.data);

    setPrediction(res.data); // ✅ this fills AI tips
  } catch (err) {
    console.log("ML Prediction error:", err);
  }
};

  useEffect(() => {
    fetchExpenses();
    fetchSummary();
    fetchGoals();
    fetchMLPrediction();
  }, []);

   // ✅ ADD goals here
   useEffect(() => {
  if (expenses.length > 0 && goals.length > 0) {

    setGoalPredictions([]); // 🔥 reset first

    goals.forEach((goal) => {
      fetchDashboardPrediction(goal);
    });

  }
}, [expenses, goals]);
  /* ================= ADD OR UPDATE EXPENSE ================= */
  const handleAddExpense = async () => {
    if (!title || !amount) return;

    try {
      if (editId !== null) {
        await API.put(`/expenses/${editId}`, {
          title,
          amount: Number(amount),
        });
        setEditId(null);
      } else {
        await API.post("/expenses", {
          title,
          amount: Number(amount),
        });
      }

      setTitle("");
      setAmount("");
      fetchExpenses();
      fetchSummary();
    } catch (err) {
      console.log("Add/Update expense error:", err);
    }
  };

  /* ================= DELETE EXPENSE ================= */
  const handleDelete = async (id) => {
    try {
      await API.delete(`/expenses/${id}`);
      fetchExpenses();
      fetchSummary();
    } catch (err) {
      console.log("Delete expense error:", err);
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  /* ================= DETECT CATEGORY ================= */
  const detectCategory = (title) => {
    const text = title.toLowerCase();
    if (
      ["pizza", "burger", "food", "swiggy", "zomato", "restaurant"].some((w) =>
        text.includes(w),
      )
    )
      return "Food 🍔";
    if (
      ["rapido", "uber", "ola", "bus", "train", "petrol", "fuel"].some((w) =>
        text.includes(w),
      )
    )
      return "Transport 🚗";
    if (
      ["amazon", "flipkart", "shopping", "clothes"].some((w) =>
        text.includes(w),
      )
    )
      return "Shopping 🛍";
    if (["movie", "netflix", "game"].some((w) => text.includes(w)))
      return "Entertainment 🎬";
    return "Other 📦";
  };

  const fetchDashboardPrediction = async (goal) => {
  try {
    const res = await API.post(
      "/set-goal",
      {
        title: goal.title,
        amount: Number(goal.amount),
        months: Number(goal.months),
      },
      {
        headers: { Authorization: token },
      }
    );

    console.log("Dashboard API Response:", res.data);

    setGoalPredictions((prev) => {
      const filtered = prev.filter((g) => g.goal !== goal.title);

      const newData = {
        goal: goal.title,
        monthlySaving: Number(res.data.monthlySaving) || 0,
        remaining: Number(res.data.remaining) || 0,
        possible: res.data.possible,
        category_adjustments: res.data.category_adjustments || [],
        deficit: Number(res.data.deficit) || 0,
        suggestedMonths:
          Number(res.data.suggestedMonths) || goal.months,
      };

      console.log("🔥 FRONTEND DATA:", newData);

      return [...filtered, newData];
    });

  } catch (err) {
    console.log("Dashboard prediction error:", err);
  }
};
  
  const remainingAmount = summary.remaining;
  const totalExpenseAmount = summary.totalExpense;
  const salaryAmount = summary.salary;

  const handleSetGoal = async () => {
    if (!goalTitle || !goalAmount || !goalMonths) return;

    try {
      const res = await API.post(
        "/set-goal",
        {
          title: goalTitle,
          amount: goalAmount,
          months: goalMonths,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setGoalPredictions((prev) => {
        const exists = prev.find((g) => g.goal === goalTitle);

        if (exists) return prev;

        return [
          ...prev,
          {
            goal: goalTitle,
            monthlySaving: res.data.monthlySaving,
            remaining: res.data.remaining,
            possible: res.data.possible,
            category_adjustments: res.data.category_adjustments || [],
            deficit: res.data.deficit || 0,
      suggestedMonths: res.data.suggestedMonths || res.goal.months,
          },
        ];
      });
    } catch (err) {
      console.log("Goal prediction error:", err);
    }
  };

  const fetchGoals = async () => {
    try {
      const userId = localStorage.getItem("userId");

      const res = await axios.get(`http://localhost:4000/api/goals/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setGoals(res.data);
      return res.data;
    } catch (err) {
      console.log("Fetch goals error:", err);
    }
  };

  const addGoal = async () => {
    // console.log("editGoalId:", editGoalId);
    try {
      const userId = localStorage.getItem("userId");

      // if (editGoalId) {
      //   await editGoal(editGoalId, {
      //     title: goalTitle,
      //     amount: Number(goalAmount),
      //     months: Number(goalMonths),
      //     oldTitle: oldGoalTitle, // ✅ ADD THIS
      //   });

      //   setEditGoalId(null);
      //   return;
      // }
      if (editGoalId) {
        await axios.put(
          `http://localhost:4000/api/goal/${editGoalId}`,
          {
            title: goalTitle,
            amount: Number(goalAmount),
            months: Number(goalMonths),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ MUST BE THIS
            },
          },
        );

        setEditGoalId(null);
      } else {
        await axios.post(
          "http://localhost:4000/api/add-goal",
          {
            title: goalTitle,
            amount: Number(goalAmount),
            months: Number(goalMonths),
            user: userId,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
      }

      setGoalTitle("");
      setGoalAmount("");
      setGoalMonths("");

      fetchGoals();
    } catch (err) {
      console.log("Add/Edit goal error:", err);
    }
  };
  const deleteGoal = async (id) => {
    try {
      const goalToDelete = goals.find((g) => g._id === id);

      await axios.delete(`http://localhost:4000/api/goal/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setGoalPredictions((prev) =>
        prev.filter((p) => p.goal !== goalToDelete.title),
      );

      fetchGoals();
    } catch (err) {
      console.log("Delete goal error:", err);
    }
  };

  const editGoal = async (id, updatedGoal) => {
    try {
      await axios.put(`http://localhost:4000/api/goal/${id}`, updatedGoal, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Recalculate prediction after editing goal
      const res = await API.post(
        "/api/dashboard-prediction",
        {
          title: updatedGoal.title,
          amount: updatedGoal.amount,
          months: updatedGoal.months,
        },
        {
          headers: { Authorization: token },
        },
      );

      // Update goal analysis
      setGoalPredictions((prev) => {
        // ❌ remove old goal prediction
        const filtered = prev.filter((g) => g.goal !== updatedGoal.oldTitle);

        // ✅ add updated prediction
        return [
          ...filtered,
          {
            goal: updatedGoal.title,
            monthlySaving: res.data.goal.monthlySaving,
            remaining: res.data.goal.remaining,
            possible: res.data.goal.possible,
            category_adjustments: res.data.goal.category_adjustments,
            goal_saving_tips: res.data.goal.goalTips,
          },
        ];
      });
    } catch (err) {
      console.log("Edit goal error:", err);
    }
  };

  function generateSavingPlan(goalAmount, months) {
    let remaining = goalAmount;
    let plan = [];

    for (let i = 1; i <= months; i++) {
      let save;

      if (i % 2 === 0) {
        // save more in even months
        save = Math.round((remaining / (months - i + 1)) * 1.2);
      } else {
        // save less in odd months
        save = Math.round((remaining / (months - i + 1)) * 0.8);
      }

      if (save > remaining) save = remaining;

      remaining -= save;

      plan.push({
        month: i,
        amount: save,
      });
    }

    return plan;
  }

  function checkGoalFeasibility(goalAmount, months, remainingMoney) {
    const requiredMonthlySaving = goalAmount / months;

    if (remainingMoney >= requiredMonthlySaving) {
      return {
        status: "achievable",
        message: "✔ Goal is achievable with your current savings.",
      };
    }

    if (remainingMoney >= requiredMonthlySaving * 0.7) {
      return {
        status: "warning",
        message: "⚠ You may need to reduce some expenses to reach this goal.",
      };
    }

    return {
      status: "not_possible",
      message:
        "❌ This goal is difficult with current spending. Try increasing months or reducing expenses.",
    };
  }
  const allTips = [
    ...new Set([
      ...defaultTips,
      ...(prediction?.saving_tips || []),
      ...goalPredictions.flatMap((g) => g.goal_saving_tips || []),
    ]),
  ].slice(0, 6);

 const handleAutoFix = async (data) => {
  try {
    const goalToUpdate = goals.find((g) => g.title === data.goal);

    if (!goalToUpdate) return;

    // ✅ Update goal in backend
    await axios.put(
      `http://localhost:4000/api/goal/${goalToUpdate._id}`,
      {
        title: goalToUpdate.title,
        amount: goalToUpdate.amount,
        months: data.suggestedMonths,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // ✅ IMPORTANT: refetch goals
    const updatedGoals = await fetchGoals();

    // ❗ FORCE recalculation manually
    setGoalPredictions([]);

    goals.forEach((g) => {
      fetchDashboardPrediction({
        title: g.title,
        amount: g.amount,
        months: g.title === data.goal ? data.suggestedMonths : g.months,
      });
    });

  } catch (err) {
    console.log("AutoFix Error:", err);
  }
};
  return (
    <div className="dashboard-container">
      <h2>Expense Dashboard 💜</h2>

      {/* ✅ NAVBAR */}
      <div className="navbar">
        <button onClick={() => setActiveTab("expenses")}>Expenses</button>
        <button onClick={() => setActiveTab("goals")}>Goals</button>
        <button onClick={() => setActiveTab("analysis")}>Analysis</button>
        <button onClick={() => setActiveTab("tips")}>Tips</button>
      </div>

      {/* ✅ COMPONENT SWITCH */}
      {activeTab === "expenses" && (
        <ExpenseSection
          title={title}
          amount={amount}
          setTitle={setTitle}
          setAmount={setAmount}
          handleAddExpense={handleAddExpense}
          editId={editId}
          expenses={expenses}
          handleDelete={handleDelete}
          setEditId={setEditId}
          salaryInput={salaryInput}
  setSalaryInput={setSalaryInput}
  handleSalaryUpdate={handleSalaryUpdate}
        />
      )}

      {activeTab === "goals" && (
        <GoalSection
          goalTitle={goalTitle}
          goalAmount={goalAmount}
          goalMonths={goalMonths}
          setGoalTitle={setGoalTitle}
          setGoalAmount={setGoalAmount}
          setGoalMonths={setGoalMonths}
          addGoal={addGoal}
          goals={goals}
          deleteGoal={deleteGoal}
          setEditGoalId={setEditGoalId}
          setOldGoalTitle={setOldGoalTitle}
        />
      )}

      {/* {activeTab === "analysis" && goals.map((goal, index) => (
  <GoalAnalysis
    key={index}
    goal={goal}
    prediction={prediction}
  />
))} */}
      
      {activeTab === "analysis" &&
  goalPredictions.map((data, index) => (
    <GoalAnalysis
      key={index}
      data={data}
      prediction={prediction}
      onAutoFix ={handleAutoFix}
    />
))}

      {activeTab === "tips" && (
        <SmartTips
          allTips={allTips}
          // goal = {goal}
          prediction={prediction}
          goalPredictions={goalPredictions}
        />
      )}

      {/* KEEP THESE ALWAYS */}
      <SummaryCards summary={summary} />
      <ExpenseChart categoryData={categoryData} />
      
    </div>
  );
}

export default Dashboard;