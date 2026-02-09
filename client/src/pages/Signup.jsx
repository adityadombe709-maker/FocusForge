import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function Signup({setIsLoggedIn}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = () => {
    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    setIsLoggedIn(true);
    localStorage.setItem("loggedIn", "true");
    navigate("/dashboard");
  }
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
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
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
