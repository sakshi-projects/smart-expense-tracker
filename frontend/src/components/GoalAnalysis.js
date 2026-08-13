

// import React from "react";

// function GoalAnalysis({ data, prediction }) {
//   const canAchieve = data.possible;
//   const deficit = data.deficit || 0;

//   return (
//     <div className={`summary-card ${!canAchieve ? "over" : ""}`}>
//       <h3>Goal Analysis 🎯</h3>

//       {prediction?.overspending_alert === 1 && (
//         <p style={{ color: "red", fontWeight: "bold" }}>
//           ⚠ You are overspending overall!
//         </p>
//       )}

//       <p><b>{data.goal}</b></p>

//       <p>Monthly Saving: ₹{data.monthlySaving}</p>

//       {canAchieve ? (
//         <p style={{ color: "green", fontWeight: "bold" }}>
//           ✅ You can achieve this goal!
//         </p>
//       ) : (
//         <>
//           <p style={{ color: "red", fontWeight: "bold" }}>
//             ⚠ You need ₹{deficit} more per month
//           </p>

//           <p style={{ color: "red" }}>
//             ❌ Not achievable with current spending
//           </p>

//           {/* 🔥 SMART OPTIONS */}
//           <div style={{ marginTop: "10px" }}>
//             <p><b>💡 Fix Options:</b></p>

//             {/* CATEGORY FIX */}
//             {data.category_adjustments?.length > 0 && (
//               <div>
//                 <p>👉 Reduce:</p>
//                 {data.category_adjustments.map((c, i) => (
//                   <p key={i}>
//                     {c.category} by ₹{c.amount}
//                   </p>
//                 ))}
//               </div>
//             )}

//             {/* MONTH FIX */}
//             <p style={{ marginTop: "8px" }}>
//               👉 OR increase duration to{" "}
//               <b>{data.suggestedMonths} months</b>
//             </p>
//             <button
//   style={{
//     marginTop: "10px",
//     padding: "6px 12px",
//     background: "#8b5cf6",
//     color: "white",
//     border: "none",
//     borderRadius: "6px",
//     cursor: "pointer"
//   }}
//   onClick={() => {
//     alert(`Set goal duration to ${data.suggestedMonths} months`);
//   }}
// >
//   ⚡ Fix Automatically
// </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// export default GoalAnalysis;

import React from "react";

function GoalAnalysis({ data, prediction, onAutoFix }) {
  const canAchieve = data?.possible === true;
  const deficit = Math.max(
  Number(data?.deficit) || (data?.monthlySaving - data?.remaining),
  0
);
  return (
    <div className={`summary-card ${!canAchieve ? "over" : ""}`}>
      <h3>Goal Analysis 🎯</h3>

      {/* 🚨 Overspending */}
      {prediction?.overspending_alert === 1 && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          ⚠ You are overspending overall!
        </p>
      )}

      <p><b>{data?.goal}</b></p>

      <p>Monthly Saving: ₹{data.monthlySaving || 0}</p>

      {canAchieve ? (
        <p style={{ color: "green", fontWeight: "bold" }}>
          ✅ You can achieve this goal!
        </p>
      ) : (
        <>
          <p style={{ color: "red", fontWeight: "bold" }}>
           ⚠ You need ₹{data.deficit || 0} more per month
          </p>

          <p style={{ color: "red" }}>
            ❌ Not achievable with current spending
          </p>

          {/* 🔥 SMART OPTIONS */}
          <div style={{ marginTop: "10px" }}>
            <p><b>💡 Fix Options:</b></p>

            {/* ✅ CATEGORY CUTS */}
            {/* {data?.category_adjustments?.length > 0 ? (
              data.category_adjustments.map((adj, i) => (
                <p key={i}>
                  🔻 Reduce <b>{adj.category}</b> by{" "}
                  <b>₹{adj.amount || 0}</b>
                </p>
              ))
            ) : (
              <p>No suggestions available</p>
            )} */}

            {data.category_adjustments && data.category_adjustments.length > 0 ? (
  data.category_adjustments.map((adj, i) => (
    <p key={i}>
      🔻 Reduce <b>{adj.category}</b> by <b>₹{adj.amount || 0}</b>
    </p>
  ))
) : (
  <p>No suggestions available</p>
)}

            {/* ✅ MONTH FIX */}
            {/* <p style={{ marginTop: "8px" }}>
              👉 OR increase duration to{" "}
              <b>{data?.suggestedMonths || "X"} months</b>
            </p> */}
{/* 
            <button
              style={{
                marginTop: "10px",
                padding: "6px 12px",
                background: "#8b5cf6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
              onClick={() => {
                onAutoFix(data.goal, data.suggestedMonths);
              }}
            >
              ⚡ Fix Automatically
            </button> */}
          </div>
        </>
      )}
    </div>
  );
}

export default GoalAnalysis;