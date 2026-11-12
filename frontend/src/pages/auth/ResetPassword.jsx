import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import { resetPasswordStyles as s } from "../../assets/dummyStyles.js";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { API_URL } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password/${token}`, {
        password,
      });

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid or expired reset link. Please request a new one."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.container}>
      <div className={s.centerWrapper}>
        <div className={s.formCard}>
          <h2 className={s.title}>Set New Password</h2>
          <p className={s.subtitle}>Please enter and confirm your new secure password</p>

          {error && <div className={s.errorMessage}>{error}</div>}
          {success && (
            <div className={s.successMessage}>
              Password updated successfully! Redirecting you to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className={s.form}>
            <div>
              <label className={s.label}>New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div>
              <label className={s.label}>Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={s.input}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className={s.submitButton}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <p className={s.footerText}>
            <Link to="/login" className={s.link}>
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;