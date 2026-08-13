import React from "react";

function ExpenseSection({
  title,
  amount,
  setTitle,
  setAmount,
  handleAddExpense,
  editId,
  expenses,
  handleDelete,
  setEditId,salaryInput,
  setSalaryInput,
  handleSalaryUpdate

}) {
  return (
    <>
      <form
        className="expense-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleAddExpense();
        }}
      >
        <input
  type="number"
  placeholder="Enter Salary"
  value={salaryInput}
  onChange={(e) => setSalaryInput(e.target.value)}
  onBlur={handleSalaryUpdate}
/>
        <input
          type="text"
          placeholder="Expense Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <button type="submit">
          {editId ? "Update Expense" : "Add Expense"}
        </button>
      </form>

      <div className="expense-list">
        {expenses.map((item) => (
          <div className="expense-card" key={item._id}>
            <div className="expense-left">
              <h4>{item.title}</h4>
              <p className="category">{item.category}</p>
            </div>

            <div className="expense-right">₹{item.amount}</div>

            <button
              onClick={() => {
                setTitle(item.title);
                setAmount(item.amount);
                setEditId(item._id);
              }}
            >
              Edit
            </button>

            <button
              className="delete-btn"
              onClick={() => handleDelete(item._id)}
            >
              🗑
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default ExpenseSection;