import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import { loginStyles as s } from "../../assets/dummyStyles.js";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password);
      if (data.user?.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.user?.role === "seller") {
        navigate("/dashboard");
      } else {
        navigate(from);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.pageContainer}>
      <div className={s.containerCenter}>
        <div className={s.card}>
          <h2 className={s.title}>Welcome Back</h2>
          <p className={s.subtitle}>Log in to access your properties & inquiries</p>

          {error && <div className={s.errorAlert}>{error}</div>}

          <form onSubmit={handleSubmit} className={s.form}>
            <div>
              <label className={s.label}>Email Address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className={s.input}
              />
            </div>

            <div>
              <div className={s.passwordHeader}>
                <label className={s.label}>Password</label>
                <Link to="/forgot-password" className={s.forgotLink}>
                  Forgot Password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={s.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className={s.submitButton}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className={s.footerText}>
            Don't have an account?{" "}
            <Link to="/register" className={s.registerLink}>
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;