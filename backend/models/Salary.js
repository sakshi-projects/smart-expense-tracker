const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },

  month: {
    type: String,
    required: true
  },
  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
}
});

module.exports = mongoose.model("Salary", salarySchema);