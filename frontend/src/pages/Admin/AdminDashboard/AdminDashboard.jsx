import React, { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FaUser, FaRoute, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
import { fetchDashboardStats } from '../../../services/admin';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getStats = async () => {
            try {
                const data = await fetchDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        getStats();
    }, []);

    const handleLogout = () => {
        logout(); 
        navigate('/signin'); 
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Welcome, Admin!</h1>
                <p className={styles.subtitle}>WanderLog Dashboard</p>
            </header>
            
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <FaUser className={styles.icon} />
                    <span className={styles.statValue}>{stats.totalItineraries}</span>
                    <span className={styles.statLabel}>Total Itineraries</span>
                </div>
                <div className={styles.statCard}>
                    <FaChartBar className={styles.icon} />
                    <span className={styles.statValue}>{stats.thisWeekItineraries}</span>
                    <span className={styles.statLabel}>Itineraries This Week</span>
                </div>
                <div className={styles.statCard}>
                    <FaChartBar className={styles.icon} />
                    <span className={styles.statValue}>{stats.thisMonthItineraries}</span>
                    <span className={styles.statLabel}>Itineraries This Month</span>
                </div>
                <div className={styles.statCard}>
                    <FaChartBar className={styles.icon} />
                    <span className={styles.statValue}>{stats.thisYearItineraries}</span>
                    <span className={styles.statLabel}>Itineraries This Year</span>
                </div>
            </div>

            <nav className={styles.navBar}>
                <Link to="/admin/users" className={styles.navLink}>
                    <FaUser className={styles.navIcon} />
                    Manage Users
                </Link>
                <Link to="/admin/itineraries" className={styles.navLink}>
                    <FaRoute className={styles.navIcon} />
                    Manage Itineraries
                </Link>
                <button onClick={handleLogout} className={styles.navLink}>
                    <FaSignOutAlt className={styles.navIcon} />
                    Logout
                </button>
            </nav>
        </div>
    );
};

export default AdminDashboard;
