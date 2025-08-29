import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../../services/auth';
import styles from './ForgotPassword.module.css';
import backgroundImage from '../../../assets/images/background.jpg';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setMessage('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
    } catch (err) {
      const errorMessage = typeof err === 'object' 
        ? err.message || err.error || JSON.stringify(err)
        : err || 'Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper} style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className={styles.container}>
        <h2 className={styles.title}>Quên Mật Khẩu</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {message && <p className={styles.success}>{message}</p>}
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.formGroup}>
            <label htmlFor="email">Email của bạn:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Đang gửi yêu cầu...' : 'Gửi liên kết đặt lại mật khẩu'}
          </button>
        </form>
        <p className={styles.linkText}>
          <Link to="/signin">Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
