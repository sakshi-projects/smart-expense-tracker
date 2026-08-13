const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");

const Expense = require("../models/Expense");
const Goal = require("../models/Goal");

// Generate PDF Report
router.get("/generate", async (req, res) => {
  try {
    const expenses = await Expense.find();
    const goals = await Goal.find();

    let totalExpense = 0;
    expenses.forEach(e => totalExpense += e.amount);

    const salary = 50000; // You can later make this dynamic
    const remaining = salary - totalExpense;

    // Risk calculation
    let risk = "Low Risk 🟢";
    if (remaining < 10000) risk = "Medium Risk 🟡";
    if (remaining < 5000) risk = "High Risk 🔴";

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Financial_Report.pdf");

    doc.pipe(res);

    // Title
    doc.fontSize(20).text("SMART EXPENSE TRACKER", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text("Monthly Financial Report", { align: "center" });
    doc.moveDown(2);

    // Income Summary
    doc.fontSize(14).text("Income Summary");
    doc.moveDown();
    doc.fontSize(12).text(`Salary: ₹${salary}`);
    doc.text(`Total Expense: ₹${totalExpense}`);
    doc.text(`Remaining Balance: ₹${remaining}`);
    doc.text(`Risk Level: ${risk}`);
    doc.moveDown(2);

    // Expense Breakdown
    doc.fontSize(14).text("Expense Breakdown");
    doc.moveDown();

    expenses.forEach((e, index) => {
      doc.fontSize(12).text(`${index + 1}. ${e.title} - ₹${e.amount}`);
    });

    doc.moveDown(2);

    // Goal Summary
    doc.fontSize(14).text("Goal Summary");
    doc.moveDown();

    goals.forEach(g => {
      const monthlyRequired = (g.price / g.months).toFixed(2);
      doc.fontSize(12).text(`Goal: ${g.title}`);
      doc.text(`Target Amount: ₹${g.price}`);
      doc.text(`Months: ${g.months}`);
      doc.text(`Required Monthly Saving: ₹${monthlyRequired}`);
      doc.moveDown();
    });

    doc.moveDown();
    doc.text("----------------------------------------");
    doc.text("Generated Automatically by Smart Expense Tracker", { align: "center" });

    doc.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;