import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './AdminUsers.module.css';
import {
  Users,
  UserCheck,
  UserX,
  User,
  Trash2,
  Eye,
  ArrowLeft,
  Search,
  Heart,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import { fetchUsers, updateUserStatus, deleteUser, fetchDashboardStats } from '../../../services/admin';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isActivating, setIsActivating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const getData = async () => {
      try {
        const [usersData, statsData] = await Promise.all([
          fetchUsers(searchTerm),
          fetchDashboardStats(),
        ]);
        setUsers(usersData);
        setDashboardStats(statsData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [searchTerm]);

  const handleOpenModal = (user, isActivatingAction) => {
    setSelectedUser(user);
    setIsActivating(isActivatingAction);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setReason('');
    setSelectedUser(null);
    setIsActivating(false);
  };

  const handleConfirmAction = async () => {
    if (!reason.trim()) {
      alert("Lý do không được để trống.");
      return;
    }

    setActioning(selectedUser.id);
    try {
      await updateUserStatus(selectedUser.id, isActivating, reason);
      const updatedUsers = await fetchUsers(searchTerm);
      setUsers(updatedUsers);
      const updatedStats = await fetchDashboardStats();
      setDashboardStats(updatedStats);
    } catch (error) {
      console.error("Failed to update user status", error);
    } finally {
      setActioning(null);
      handleCloseModal();
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.")) {
      return;
    }
    setActioning(userId);
    try {
      await deleteUser(userId);
      const updatedUsers = await fetchUsers(searchTerm);
      setUsers(updatedUsers);
      const updatedStats = await fetchDashboardStats();
      setDashboardStats(updatedStats);
    } catch (error) {
      console.error("Failed to delete user", error);
    } finally {
      setActioning(null);
    }
  };

const activeUsersCount = dashboardStats?.activeUsers || 0;
const inactiveUsersCount = (dashboardStats?.totalUsers || 0) - activeUsersCount;

const LoadingHeart = () => (
    <div className={styles.loadingContainer}>
        <div className={styles.loadingHeart}>
            <Heart className={styles.heartIcon} />
        </div>
        <p>Loading itinerary</p>
    </div>
);

  if (loading) {
    return <LoadingHeart />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/admin/dashboard" className={styles.backButton}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className={styles.title}>Manage Users</h1>
      </header>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Users size={40} className={styles.statIconTotal} />
          <div className={styles.statContent}>
            <span className={styles.statValue}>{dashboardStats?.totalUsers?.toLocaleString() || 0}</span>
            <span className={styles.statLabel}>Total Users</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <UserCheck size={40} className={styles.statIconActive} />
          <div className={styles.statContent}>
            <span className={styles.statValue}>{activeUsersCount?.toLocaleString() || 0}</span>
            <span className={styles.statLabel}>Active Users</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <UserX size={40} className={styles.statIconInactive} />
          <div className={styles.statContent}>
            <span className={styles.statValue}>{inactiveUsersCount?.toLocaleString() || 0}</span>
            <span className={styles.statLabel}>Inactive Users</span>
          </div>
        </div>
      </div>

      <div className={styles.searchAndTableContainer}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <Search className={styles.searchIcon} />
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created At</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id.substring(0, 8)}...</td>
                    <td>{user.email}</td>
                    <td>{user.name || 'N/A'}</td>
                    <td>{user.role}</td>
                    <td>
                      <span className={user.isActive ? styles.statusActive : styles.statusInactive}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className={styles.actions}>
                      <Link to={`/admin/users/${user.id}`} className={styles.actionButton}>
                        <Eye size={16} />
                      </Link>
                      {user.isActive ? (
                        <button
                          className={`${styles.actionButton} ${styles.deactivate}`}
                          onClick={() => handleOpenModal(user, false)}
                          disabled={actioning === user.id}
                        >
                          <XCircle size={16} />
                        </button>
                      ) : (
                        <button
                          className={`${styles.actionButton} ${styles.activate}`}
                          onClick={() => handleOpenModal(user, true)}
                          disabled={actioning === user.id}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        className={`${styles.actionButton} ${styles.delete}`}
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={actioning === user.id}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={styles.noData}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>{isActivating ? 'Activate User' : 'Deactivate User'}</h3>
            <p className={styles.modalUserTitle}>User: {selectedUser?.name || selectedUser?.email}</p>
            <div className={styles.formGroup}>
              <label htmlFor="reason">Reason for {isActivating ? 'activation' : 'deactivation'}:</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="4"
                required
              ></textarea>
            </div>
            <div className={styles.modalActions}>
              <button
                className={`${styles.modalButton} ${isActivating ? styles.activate : styles.deactivate}`}
                onClick={handleConfirmAction}
              >
                Confirm
              </button>
              <button className={`${styles.modalButton} ${styles.cancel}`} onClick={handleCloseModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
