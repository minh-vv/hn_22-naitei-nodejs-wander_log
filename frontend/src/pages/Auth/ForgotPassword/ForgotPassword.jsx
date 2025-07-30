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
      setMessage('A password reset link has been sent to your email. Please check your inbox.');
    } catch (err) {
      setError(err || 'An error occurred while sending the request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper} style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className={styles.container}>
        <h2 className={styles.title}>Forgot Password</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {message && <p className={styles.success}>{message}</p>}
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.formGroup}>
            <label htmlFor="email">Your Email:</label>
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
            {loading ? 'Sending Request...' : 'Send Reset Password Link'}
          </button>
        </form>
        <p className={styles.linkText}>
          <Link to="/signin">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
