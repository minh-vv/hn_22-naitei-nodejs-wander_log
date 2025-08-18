import React, { useState, useEffect } from 'react';
import styles from './AdminUsers.module.css';
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { fetchUsers, updateUserStatus, deleteUser } from '../../../services/admin';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actioning, setActioning] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [reason, setReason] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isActivating, setIsActivating] = useState(false);

    useEffect(() => {
        getUsers();
    }, []);

    const getUsers = async () => {
        try {
            const data = await fetchUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

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
            getUsers();
        } catch (error) {
            console.error("Failed to update user status", error);
        } finally {
            setActioning(null);
            handleCloseModal();
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action is irreversible.")) {
            return;
        }
        setActioning(userId);
        try {
            await deleteUser(userId);
            getUsers();
        } catch (error) {
            console.error("Failed to delete user", error);
        } finally {
            setActioning(null);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading users...</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Manage Users</h1>
                <p className={styles.subtitle}>Admin Panel</p>
            </header>
            
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
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.email}</td>
                                <td>{user.name}</td>
                                <td>{user.role}</td>
                                <td>
                                    <span className={user.isActive ? styles.activeStatus : styles.inactiveStatus}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className={styles.actions}>
                                    {user.isActive ? (
                                        <button 
                                            className={`${styles.actionButton} ${styles.deactivate}`} 
                                            onClick={() => handleOpenModal(user, false)}
                                            disabled={actioning === user.id}
                                        >
                                            <FaTimesCircle /> Deactivate
                                        </button>
                                    ) : (
                                        <button 
                                            className={`${styles.actionButton} ${styles.activate}`} 
                                            onClick={() => handleOpenModal(user, true)}
                                            disabled={actioning === user.id}
                                        >
                                            <FaCheckCircle /> Activate
                                        </button>
                                    )}
                                    <button 
                                        className={`${styles.actionButton} ${styles.delete}`} 
                                        onClick={() => handleDeleteUser(user.id)}
                                        disabled={actioning === user.id}
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>{isActivating ? 'Activate User' : 'Deactivate User'}</h3>
                        <p>User: {selectedUser?.name || selectedUser?.email}</p>
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
                                className={`${styles.actionButton} ${isActivating ? styles.activate : styles.deactivate}`} 
                                onClick={handleConfirmAction}
                            >
                                Confirm {isActivating ? 'Activate' : 'Deactivate'}
                            </button>
                            <button className={`${styles.actionButton} ${styles.cancel}`} onClick={handleCloseModal}>
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
