import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import { forgotPasswordStyles as s } from "../../assets/dummyStyles.js";

const ForgotPassword = () => {
  const { API_URL } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email,
      });
      setMessage(
        res.data?.message ||
          "If an account exists with this email, a reset link has been dispatched."
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to process request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.pageContainer || "bg-bg-alt min-h-screen pt-32 max-lg:pt-28"}>
      <div className={s.containerCenter || "container flex justify-center items-center pt-16 sm:pt-8"}>
        <div className={s.card || "glass fade-in w-full max-w-[450px] p-10 sm:p-6 rounded-3xl sm:rounded-2xl shadow-card"}>
          <h2 className={s.title || "text-[2rem] sm:text-2xl font-bold text-center mb-2 text-primary"}>
            Reset Password
          </h2>
          <p className={s.subtitle || "text-center text-text-muted mb-8"}>
            Enter your account email to receive a password reset link
          </p>

          {error && (
            <div className="p-3 bg-red-100 text-red-600 rounded-lg mb-4 text-sm text-center">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 bg-green-100 text-green-700 rounded-lg mb-4 text-sm text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className={s.form}>
            <div>
              <label className={s.label}>Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={s.input}
              />
            </div>

            <button type="submit" disabled={loading} className={s.submitButton}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className={s.footerText}>
            Remembered your password?{" "}
            <Link to="/login" className={s.link}>
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
