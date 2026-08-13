import React from "react";
function generateSavingPlan(goalAmount, months) {
  let remaining = goalAmount;
  let plan = [];

  for (let i = 1; i <= months; i++) {
    let save;

    if (i % 2 === 0) {
      save = Math.round((remaining / (months - i + 1)) * 1.2);
    } else {
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
function GoalSection({
  goalTitle,
  goalAmount,
  goalMonths,
  setGoalTitle,
  setGoalAmount,
  setGoalMonths,
  addGoal,
  goals,
  deleteGoal,
  setEditGoalId,
  setOldGoalTitle,
}) {
  return (
    <>
      <form
        className="expense-form"
        onSubmit={(e) => {
          e.preventDefault();
          addGoal();
        }}
      >
        <input
          type="text"
          placeholder="Goal"
          value={goalTitle}
          onChange={(e) => setGoalTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          value={goalAmount}
          onChange={(e) => setGoalAmount(e.target.value)}
        />

        <input
          type="number"
          placeholder="Months"
          value={goalMonths}
          onChange={(e) => setGoalMonths(Number(e.target.value))}
        />

        <button type="submit">Set Goal 🎯</button>
      </form>

      <div className="goals-container">
        {goals.map((goal) => {
  const savingPlan = generateSavingPlan(goal.amount, goal.months);

  return (
    <div className="goal-card" key={goal._id}>
      <h3>{goal.title}</h3>
      <p>₹{goal.amount}</p>

      {/* ✅ ADD THIS BLOCK */}
      <div className="saving-plan">
        <h4>Flexible Saving Plan</h4>

        {savingPlan.map((item) => (
          <p key={item.month}>
            Month {item.month} → Save ₹{item.amount}
          </p>
        ))}
      </div>

      <button onClick={() => deleteGoal(goal._id)}>Delete</button>

      <button
        onClick={() => {
          setGoalTitle(goal.title);
          setGoalAmount(goal.amount);
          setGoalMonths(goal.months);
          setEditGoalId(goal._id);
          setOldGoalTitle(goal.title);
        }}
      >
        Edit
      </button>
    </div>
  );
})}
      </div>
    </>
  );
}

export default GoalSection;