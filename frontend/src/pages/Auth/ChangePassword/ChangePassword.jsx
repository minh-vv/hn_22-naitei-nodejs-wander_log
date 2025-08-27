import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../../services/auth";
import Header from "../../../component/Header/Header";
import styles from "./ChangePassword.module.css";

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (password.length < minLength) {
      return "Mật khẩu phải có ít nhất 8 ký tự";
    }
    if (!hasUpperCase) {
      return "Mật khẩu phải có ít nhất một chữ cái viết hoa";
    }
    if (!hasLowerCase) {
      return "Mật khẩu phải có ít nhất một chữ cái viết thường";
    }
    if (!hasNumbers) {
      return "Mật khẩu phải có ít nhất một số";
    }
    return "";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else {
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        newErrors.newPassword = passwordError;
      }
    }

    if (!confirmNewPassword) {
      newErrors.confirmNewPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = "Xác nhận mật khẩu không khớp";
    }

    if (newPassword && currentPassword && newPassword === currentPassword) {
      newErrors.newPassword = "Mật khẩu mới phải khác với mật khẩu hiện tại";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem("userToken") || localStorage.getItem("userToken");
      if (!token) {
        setError("Bạn cần đăng nhập để đổi mật khẩu.");
        setLoading(false);
        navigate("/signin");
        return;
      }

      await authService.changePassword(currentPassword, newPassword, confirmNewPassword);
      setMessage("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (err) {
      const errorMessage =
        typeof err === "object"
          ? err.message || err.error || JSON.stringify(err)
          : err ||
            "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.card}>
            <h2 className={styles.title}>Đổi Mật Khẩu</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              {message && <p className={styles.success}>{message}</p>}
              {error && <p className={styles.error}>{error}</p>}
              
              <div className={styles.formGroup}>
                <label htmlFor="currentPassword">Mật khẩu hiện tại:</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`${styles.input} ${errors.currentPassword ? styles.inputError : ''}`}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                {errors.currentPassword && <p className={styles.fieldError}>{errors.currentPassword}</p>}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="newPassword">Mật khẩu mới:</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`${styles.input} ${errors.newPassword ? styles.inputError : ''}`}
                  placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự, có chữ hoa, chữ thường và số)"
                />
                {errors.newPassword && <p className={styles.fieldError}>{errors.newPassword}</p>}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới:</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className={`${styles.input} ${errors.confirmNewPassword ? styles.inputError : ''}`}
                  placeholder="Nhập lại mật khẩu mới"
                />
                {errors.confirmNewPassword && <p className={styles.fieldError}>{errors.confirmNewPassword}</p>}
              </div>
              
              <button type="submit" className={styles.button} disabled={loading}>
                {loading ? "Đang xử lý..." : "Đổi Mật Khẩu"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChangePassword;
