// import React from "react";
// import { Link } from "react-router-dom";

// function Navbar() {
//   return (
//     <div style={{
//       display: "flex",
//       gap: "20px",
//       padding: "10px",
//       background: "#eee",
//       marginBottom: "20px"
//     }}>
//       <Link to="/dashboard">Dashboard</Link>
//       <Link to="/expenses">Expenses</Link>
//       <Link to="/goals">Goals</Link>
//     </div>
//   );
// }

// export default Navbar;

import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    navigate("/login");
  };

  return (
    <nav className="navbar">

      {/* Logo */}
      <div
        className="navbar-logo"
        onClick={() => navigate("/dashboard")}
      >
        💜 SpendSmart
      </div>

      {/* Navigation */}
      <div className="navbar-links">

        <button onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>

        <button onClick={() => navigate("/dashboard")}>
          Expenses
        </button>

        <button onClick={() => navigate("/dashboard")}>
          Goals
        </button>

        <button onClick={() => navigate("/dashboard")}>
          Analysis
        </button>

        <button onClick={() => navigate("/dashboard")}>
          Tips
        </button>

      </div>

      {/* User */}
      <div className="navbar-user">

        <span>
          👤 {userName || "User"}
        </span>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;