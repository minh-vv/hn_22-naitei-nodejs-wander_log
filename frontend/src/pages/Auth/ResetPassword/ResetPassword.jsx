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
        setError("Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.");
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
      setError("Mật khẩu là bắt buộc");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp.");
      return;
    }
    
    if (!token) {
      setError("Không tìm thấy token đặt lại mật khẩu.");
      return;
    }
    
    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setMessage("Mật khẩu của bạn đã được đặt lại thành công!");
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (err) {
      const errorMessage =
        typeof err === "object"
          ? err.message || err.error || JSON.stringify(err)
          : err ||
            "Không thể đặt lại mật khẩu. Vui lòng thử lại hoặc yêu cầu token mới.";
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
        <h2 className={styles.title}>Đặt Lại Mật Khẩu</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {message && <p className={styles.success}>{message}</p>}
          {error && <p className={styles.error}>{error}</p>}
          {!token && (
            <div className={styles.error}>
              <p>Vui lòng truy cập trang này thông qua liên kết đặt lại mật khẩu trong email của bạn.</p>
              <p><small>Nếu bạn gặp khó khăn, hãy thử yêu cầu đặt lại mật khẩu mới.</small></p>
            </div>
          )}
          {token && (
            <div className={styles.info}>
              <p><small>✓ Đã phát hiện token đặt lại hợp lệ</small></p>
            </div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="newPassword">Mật khẩu mới:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className={`${styles.input} ${newPassword && (passwordValid ? styles.valid : styles.invalid)}`}
              disabled={!token}
              placeholder="Nhập ít nhất 6 ký tự"
            />
            {newPassword && !passwordValid && (
              <small className={styles.validationError}>
                Mật khẩu phải có ít nhất 6 ký tự
              </small>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Xác nhận mật khẩu mới:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`${styles.input} ${confirmPassword && (passwordsMatch ? styles.valid : styles.invalid)}`}
              disabled={!token}
              placeholder="Xác nhận mật khẩu mới của bạn"
            />
            {confirmPassword && !passwordsMatch && (
              <small className={styles.validationError}>
                Mật khẩu không khớp
              </small>
            )}
          </div>
          <button
            type="submit"
            className={styles.button}
            disabled={loading || !token}
          >
            {loading ? "Đang đặt lại..." : "Đặt Lại Mật Khẩu"}
          </button>
        </form>
        <p className={styles.linkText}>
          <Link to="/signin">Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
