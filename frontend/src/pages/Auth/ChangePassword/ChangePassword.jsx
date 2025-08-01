import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/auth';
import styles from './ChangePassword.module.css';
import backgroundImage from '../../../assets/images/background.jpg';

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('You need to be logged in to change your password.');
        setLoading(false);
        navigate('/signin');
        return;
      }

      await authService.changePassword(currentPassword, newPassword, token);
      setMessage('Your password has been changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      // Handle both object and string errors
      const errorMessage = typeof err === 'object' 
        ? err.message || err.error || JSON.stringify(err)
        : err || 'Failed to change password. Please check your current password.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper} style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className={styles.container}>
        <h2 className={styles.title}>Change Password</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {message && <p className={styles.success}>{message}</p>}
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.formGroup}>
            <label htmlFor="currentPassword">Current Password:</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmNewPassword">Confirm New Password:</label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
