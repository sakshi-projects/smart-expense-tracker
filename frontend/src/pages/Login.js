

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import API from "../api";
// import "../styles.css"; // global CSS with lavender theme

// function Login() {
//   const navigate = useNavigate();

//   // ✅ State variables
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   // ✅ Handle Login
//   const handleLogin = async () => {
//     try {
//       const res = await API.post("/login", { email, password });
//       localStorage.setItem("token", res.data.token);
//       alert("Login Successful ✅");
//       navigate("/dashboard");
//     } catch (err) {
//       console.log(err);
//       alert(err.response?.data?.message || "Login Failed ❌");
//     }
//   };

//   return (
//     <div className="container">
//       <div className="card page-animation">
//         <h2 className="auth-title">Login</h2>
//         <p className="auth-subtext">Access your expense dashboard</p>

//         <input
//           type="email"
//           placeholder="Enter Email"
//           className="input-field"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <input
//           type="password"
//           placeholder="Enter Password"
//           className="input-field"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <button className="button" onClick={handleLogin}>
//           Login
//         </button>

//         <div className="auth-link">
//           Don't have an account?{" "}
//           <span onClick={() => navigate("/register")}>Register</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../styles.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/login", { email, password });

      localStorage.setItem("token", res.data.token);
      

if (res.data.user) {
  localStorage.setItem("userId", res.data.user._id);
  localStorage.setItem("userName", res.data.user.name);
  localStorage.setItem("userEmail", res.data.user.email);
}
      alert("Login Successful ✅");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed ❌");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Login to continue</p>

        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="auth-btn">
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>
    </div>
  );
}

export default Login;