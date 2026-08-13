// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import API from "../api";

// function Register() {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });

//   const navigate = useNavigate();

//   //   const handleRegister = async () => {
//   //     try {
//   //       await API.post("/register", form);
//   //       alert("Registered Successfully ✅");
//   //       navigate("/");
//   //     } catch (err) {
//   //       alert("Registration Failed ❌");
//   //       console.log(err);
//   //     }
//   //   };

//   const handleRegister = async () => {
//     console.log("Button Clicked"); // ADD THIS

//     try {
//       await API.post("/register", form);
//       alert("Registered Successfully ✅");
//     } catch (err) {
//       alert("Registration Failed ❌");
//       console.log(err);
//     }
//   };

//   return (
//     <div className="container">
//       <div className="card page-animation">
//         <h2 className="auth-title">Welcome Back</h2>
//         <p className="auth-subtext">Login to manage your expenses</p>

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

// export default Register;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../styles.css"; // your global CSS with lavender theme

function Register() {
  const navigate = useNavigate();

  // ✅ Define state variables
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Handle Register
  const handleRegister = async () => {
    try {
      const res = await API.post("/register", { name, email, password });
      alert("Registration Successful ✅");
      navigate("/login");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Registration Failed ❌");
    }
  };

  return (
    <div className="container">
      <div className="card page-animation">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtext">Start tracking your expenses</p>

        <input
          type="text"
          placeholder="Enter Name"
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Enter Email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="button" onClick={handleRegister}>
          Register
        </button>

        <div className="auth-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </div>
      </div>
    </div>
  );
}

export default Register;