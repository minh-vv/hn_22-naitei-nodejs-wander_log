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
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");
    if (urlToken && urlToken.trim() !== "") {
      setToken(urlToken.trim());
      setError(""); // Clear any previous errors
    } else {
      setError("Invalid or expired password reset token. Please request a new password reset.");
    }
  }, [location.search]);

  // Validate password in real-time
  useEffect(() => {
    setPasswordValid(newPassword.length >= 6);
  }, [newPassword]);

  // Check if passwords match in real-time
  useEffect(() => {
    setPasswordsMatch(newPassword === confirmPassword && confirmPassword !== "");
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    
    // Client-side validation
    if (!newPassword) {
      setError("Password is required");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
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
      await authService.resetPassword(token, newPassword);
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
            <div className={styles.error}>
              <p>Please access this page via the password reset link in your email.</p>
              <p><small>If you're having trouble, try requesting a new password reset.</small></p>
            </div>
          )}
          {token && (
            <div className={styles.info}>
              <p><small>✓ Valid reset token detected</small></p>
            </div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className={`${styles.input} ${newPassword && (passwordValid ? styles.valid : styles.invalid)}`}
              disabled={!token}
              placeholder="Enter at least 6 characters"
            />
            {newPassword && !passwordValid && (
              <small className={styles.validationError}>
                Password must be at least 6 characters long
              </small>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm New Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`${styles.input} ${confirmPassword && (passwordsMatch ? styles.valid : styles.invalid)}`}
              disabled={!token}
              placeholder="Confirm your new password"
            />
            {confirmPassword && !passwordsMatch && (
              <small className={styles.validationError}>
                Passwords do not match
              </small>
            )}
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
