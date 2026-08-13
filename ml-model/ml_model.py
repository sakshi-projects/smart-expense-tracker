import numpy as np
from sklearn.linear_model import LogisticRegression
import sys, json

def predict_reductions(expenses, salary, goal_amount, months):
    """
    expenses: dict of {category: amount}
    salary: number
    goal_amount: total savings goal
    months: number of months to achieve goal
    """

    required_monthly_saving = goal_amount / months

    # Calculate total expenses
    total_expense = sum(expenses.values())
    remaining = salary - total_expense

    deficit = required_monthly_saving - remaining

    if deficit <= 0:
        return {
            "possible": True,
            "reductions": []
        }

    categories = list(expenses.keys())
    values = list(expenses.values())

    # Prepare training data for logistic regression
    X = np.array(values).reshape(-1, 1)
    avg_expense = total_expense / len(values)
    y = np.array([1 if v > avg_expense else 0 for v in values])

    model = LogisticRegression()
    model.fit(X, y)
    predictions = model.predict(X)

    reductions = []
    total_reduction = 0

    # Calculate reductions per category
    for i, pred in enumerate(predictions):
        if pred == 1:
            reduce_by = round(values[i] * 0.2)   # high expense
        else:
            reduce_by = round(values[i] * 0.05)  # low expense

        total_reduction += reduce_by

        reductions.append({
            "category": categories[i],
            "current_spending": values[i],
            "reduce_by": reduce_by
        })

    # Scale reductions to match deficit
    scale = (deficit / total_reduction) if total_reduction > 0 else 1

    final_reductions = []
    for r in reductions:
        new_reduce = round(r["reduce_by"] * scale)
        final_reductions.append({
            "category": r["category"],
            "current_spending": r["current_spending"],
            "reduce_by": new_reduce,
            "new_budget": r["current_spending"] - new_reduce
        })

    return {
        "possible": False,
        "reductions": final_reductions
    }

# ====== Runner for Node.js ======
if __name__ == "__main__":
    # Read JSON input from Node.js
    data = json.load(sys.stdin)

    expenses = data["expenses"]
    salary = data["salary"]
    goal_amount = data["goal_amount"]
    months = data["months"]

    # Call ML function
    result = predict_reductions(expenses, salary, goal_amount, months)

    # Output JSON to stdout
    print(json.dumps(result))