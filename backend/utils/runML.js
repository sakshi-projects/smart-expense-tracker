const { spawn } = require("child_process");
const path = require("path");

function runML(expenses, salary, goalAmount, months) {

  return new Promise((resolve, reject) => {

    const scriptPath = path.join(__dirname, "../../ml-model/ml_model.py");

    const py = spawn("python", [scriptPath]);

    const data = {
      expenses,
      salary,
      goal_amount: goalAmount,
      months
    };

    py.stdin.write(JSON.stringify(data));
    py.stdin.end();

    let output = "";

    py.stdout.on("data", (data) => {
      output += data.toString();
    });

    py.stderr.on("data", (data) => {
      console.error("Python error:", data.toString());
    });

    py.on("close", () => {
      try {
        resolve(JSON.parse(output));
      } catch (err) {
        reject(err);
      }
    });

  });

}

module.exports = runML;