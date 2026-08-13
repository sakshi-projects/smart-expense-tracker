// import React from "react";

// function SmartTips({ allTips, prediction, goalPredictions }) {
//   return (
//     <div className="suggestions-section">
//       <h3>Smart Financial Tips 💡</h3>

//       {allTips.map((tip, index) => {
//         let type = "General";

//         if (goalPredictions.some((g) => g.goal_saving_tips?.includes(tip))) {
//           type = "Goal";
//         }

//         if (prediction?.saving_tips?.includes(tip)) {
//           type = "AI";
//         }

//         return (
//           <div key={index}>
//             <b>{type}:</b> {tip}
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// export default SmartTips;

import React from "react";

function SmartTips({ allTips, prediction, goalPredictions }) {
  const tips = prediction?.saving_tips || [];

  return (
    <div className="suggestions-section">
  <h3 className="section-title">💡 Smart Financial Tips</h3>

  <div className="tips-grid">
    {allTips?.map((tip, index) => {
      let type = "general";

      if (goalPredictions?.some((g) => g.goal_saving_tips?.includes(tip))) {
        type = "goal";
      }

      if (prediction?.saving_tips?.includes(tip)) {
        type = "ai";
      }

      return (
        <div className={`tip-card ${type}`} key={index}>
          
          {/* LEFT ICON */}
          <div className="tip-icon">
            {type === "ai" ? "🤖" : type === "goal" ? "🎯" : "💰"}
          </div>

          {/* CONTENT */}
          <div className="tip-text">
            <div className="tip-header">
              <span className="tip-type">
                {type === "ai"
                  ? "AI Insight"
                  : type === "goal"
                  ? "Goal Tip"
                  : "General"}
              </span>

              {type === "ai" && <span className="badge">High Impact</span>}
            </div>

            <p>{tip}</p>
          </div>
        </div>
      );
    })}
  </div>
</div>
  );
}

export default SmartTips;