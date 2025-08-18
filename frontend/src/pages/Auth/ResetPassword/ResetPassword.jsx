import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import authService from "../../../services/auth";
import styles from "./ResetPassword.module.css";
import backgroundImage from "../../../assets/images/background.jpg";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError("Invalid or expired password reset token.");
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (!token) {
      setError("Password reset token not found.");
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(newPassword);
      setMessage("Your password has been reset successfully!");
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (err) {
      const errorMessage =
        typeof err === "object"
          ? err.message || err.error || JSON.stringify(err)
          : err ||
            "Unable to reset password. Please try again or request a new token.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={styles.wrapper}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className={styles.container}>
        <h2 className={styles.title}>Reset Password</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {message && <p className={styles.success}>{message}</p>}
          {error && <p className={styles.error}>{error}</p>}
          {!token && (
            <p className={styles.error}>
              Please access this page via the password reset link in your email.
            </p>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className={styles.input}
              disabled={!token}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm New Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={styles.input}
              disabled={!token}
            />
          </div>
          <button
            type="submit"
            className={styles.button}
            disabled={loading || !token}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <p className={styles.linkText}>
          <Link to="/signin">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
