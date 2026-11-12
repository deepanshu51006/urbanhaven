import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import { registerStyles as s } from "../../assets/dummyStyles.js";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "buyer",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const data = await register(formData);
      if (data.user?.role === "seller") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.pageWrapper}>
      <div className={s.container}>
        <div className={s.formCard}>
          <h2 className={s.heading}>Create an Account</h2>
          <p className={s.subheading}>Join our community of verified buyers and sellers</p>

          {error && <div className={s.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} className={s.form}>
            {/* Role Selection */}
            <div>
              <label className={s.label}>I want to:</label>
              <div className={s.roleContainer}>
                <label
                  className={`${s.roleLabelBase} ${
                    formData.role === "buyer"
                      ? s.roleLabelActive
                      : s.roleLabelInactive
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={formData.role === "buyer"}
                    onChange={handleChange}
                    className={s.hiddenRadio}
                  />
                  <span className="font-bold">Buy / Rent Properties</span>
                </label>

                <label
                  className={`${s.roleLabelBase} ${
                    formData.role === "seller"
                      ? s.roleLabelActive
                      : s.roleLabelInactive
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={formData.role === "seller"}
                    onChange={handleChange}
                    className={s.hiddenRadio}
                  />
                  <span className="font-bold">List & Sell Properties</span>
                </label>
              </div>
            </div>

            <div>
              <label className={s.label}>Full Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Rachit Srivastava"
                value={formData.name}
                onChange={handleChange}
                className={s.input}
              />
            </div>

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
              <label className={s.label}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                className={s.input}
              />
            </div>

            <div>
              <label className={s.label}>Password (minimum 6 characters)</label>
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
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className={s.footerText}>
            Already have an account?{" "}
            <Link to="/login" className={s.loginLink}>
              Log In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;