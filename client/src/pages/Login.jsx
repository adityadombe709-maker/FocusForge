import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    try {
      const response = await axios.post("/api/login", { email, password });

      if (response.status === 200) {
        setIsLoggedIn(true);
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("userId", response.data.userId);
        navigate("/dashboard");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <button onClick={handleLogin}>Login</button>
      <p>
        Don't have an account?
        <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}
