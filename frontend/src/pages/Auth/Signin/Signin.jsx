import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../../services/auth";
import styles from "./Signin.module.css";
import backgroundImage from "../../../assets/images/background.jpg";
import { useAuth } from "../../../context/AuthContext";

function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const authError = searchParams.get("error");
    if (authError === "auth_failed") {
      setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authService.signin(email, password);
      login(data.user, data.token);
      if (data.user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
      navigate("/home");
      }
      alert("Đăng nhập thành công!");
    } catch (err) {
      const errorMessage =
        typeof err === "object" && err.message
          ? err.message
          : typeof err === "string"
          ? err
          : "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu của bạn.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignin = async (provider) => {
    if (provider === "google") {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";
      window.location.href = `${apiBaseUrl}/auth/google`;
    } else {
      alert(`Đăng nhập bằng ${provider} sẽ được triển khai tại đây.`);
    }
  };

  return (
    <div
      className={styles.wrapper}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className={styles.container}>
        <h2 className={styles.title}>Đăng Nhập</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Mật khẩu:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </button>
        </form>
        <p className={styles.linkText}>
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </p>
        <div className={styles.socialLogin}>
          <p>Hoặc đăng nhập bằng:</p>
          <button
            onClick={() => handleSocialSignin("google")}
            className={`${styles.socialButton} ${styles.google}`}
          >
            Google
          </button>
        </div>
        <p className={styles.linkText}>
          Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}

export default Signin;
