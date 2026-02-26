import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!email || !password) {
      alert("Fill all fields");
      return;
    }
    setIsLoggedIn(true);
    localStorage.setItem("loggedIn", "true");
    navigate("/dashboard");
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
