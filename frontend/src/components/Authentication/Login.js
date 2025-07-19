import React, { useState } from "react";
import { useToast } from "../ui/toaster";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      showToast({
        title: "Please fill all fields 😔",
        status: "warning",
        duration: 4000,
        position: "top",
      });
      return;
    }

    setLoading(true);
    try {
      const config = {
        headers: { "Content-Type": "application/json" },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      showToast({
        title: "Login Successful 💘",
        status: "success",
        duration: 3000,
        position: "top",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/chats");
    } catch (error) {
      showToast({
        title: "Login Failed 💔",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = async () => {
    setEmail("guest@example.com");
    setPassword("123456");

    showToast({
      title: "Logging in as Guest 😎",
      status: "info",
      duration: 2500,
      position: "top",
    });

    // Wait a moment before triggering login to allow state update
    setTimeout(() => {
      handleSubmit();
    }, 300);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Email Address <span>*</span>
      </label>
      <input
        type="email"
        placeholder="Enter Your Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label>
        Password <span>*</span>
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%" }}
        />
        <button
          className="show-password-btn"
          type="button"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <button type="submit" className="btn login-btn" disabled={loading}>
        {loading ? "Logging in 💫" : "Login"}
      </button>

      <button
        className="guest-btn"
        type="button"
        onClick={loginAsGuest}
        disabled={loading}
      >
        {loading ? "Please wait..." : "Login as Guest"}
      </button>
    </form>
  );
};

export default Login;
