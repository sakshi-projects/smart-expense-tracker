import React from "react";

function SummaryCards({ summary }) {
  return (
    <div className="financial-summary">
      <div className="card">
        <h4>Salary</h4>
        <p>₹{summary.salary}</p>
      </div>

      <div className="card">
        <h4>Expense</h4>
        <p>₹{summary.totalExpense}</p>
      </div>

      <div className="card">
        <h4>Remaining</h4>
        <p>₹{summary.remaining}</p>
      </div>
    </div>
  );
}

export default SummaryCards;