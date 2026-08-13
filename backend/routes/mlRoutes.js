// const express = require("express");
// const router = express.Router();
// const runML = require("../utils/runML");

// // Route to get ML advice for reducing expenses
// router.post("/ml-advice", async (req, res) => {
//   try {
//     const { expenses, deficit } = req.body;

//     // check input
//     if (!expenses || !deficit) {
//       return res.status(400).json({
//         message: "Expenses and deficit are required"
//       });
//     }

//     // call ML python model
//     const advice = await runML(expenses, deficit);

//     res.json({
//       success: true,
//       suggestions: advice
//     });

//   } catch (error) {
//     console.error("ML Error:", error);

//     res.status(500).json({
//       success: false,
//       message: "ML prediction failed"
//     });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const runML = require("../utils/runML");

// Route to get ML advice
router.post("/ml-advice", async (req, res) => {

  try {

    const { expenses, salary, goalAmount, months } = req.body;

    // check input
    if (!expenses || !salary || !goalAmount || !months) {
      return res.status(400).json({
        message: "expenses, salary, goalAmount, months are required"
      });
    }

    // call ML python model
    const result = await runML(expenses, salary, goalAmount, months);

    res.json({
      success: true,
      possible: result.possible,
      reductions: result.reductions   // 👈 THIS IS result["reductions"]
    });

  } catch (error) {

    console.error("ML Error:", error);

    res.status(500).json({
      success: false,
      message: "ML prediction failed"
    });

  }

});

module.exports = router;