import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("https://luct-unfz.onrender.com/api/auth/login", {
        email,
        password,
        role,
      });

      // Save token + user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect by role
      const userRole = res.data.user.role;
      switch (userRole) {
        case "student":
          navigate("/student");
          break;
        case "lecturer":
          navigate("/lecturer");
          break;
        case "pr":
          navigate("/pr");
          break;
        case "pl":
          navigate("/pl/courses");
          break;
        case "admin":
          navigate("/reports");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      if (err.response?.data?.msg) {
        setError(err.response.data.msg);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: "block", width: "100%", margin: "10px 0" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: "block", width: "100%", margin: "10px 0" }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          style={{ display: "block", width: "100%", margin: "10px 0" }}
        >
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
          <option value="pr">Program Coordinator (PR)</option>
          <option value="pl">Program Leader (PL)</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" style={{ width: "100%", padding: "10px" }}>
          Login
        </button>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </form>

      <p style={{ marginTop: "15px", textAlign: "center" }}>
        Don’t have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;
