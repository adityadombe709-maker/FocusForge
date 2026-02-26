import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export function Signup({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    // setIsLoggedIn(true);
    // localStorage.setItem("loggedIn", "true");
    // navigate("/dashboard");
    try {
      const response = await axios.post("/api/signup", {
        email,
        password,
      });

      setIsLoggedIn(true);
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userId", response.data.userId);
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "An error occurred during signup");
    }
  };
  return (
    <div>
      <h2>Signup</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSignup();
          }
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSignup();
          }
        }}
      />
      <button onClick={handleSignup}>Create Account</button>
      <p>
        Already have an account?
        <Link to="/">Login</Link>
      </p>
    </div>
  );
}
