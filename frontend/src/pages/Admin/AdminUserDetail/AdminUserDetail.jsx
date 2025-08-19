import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './AdminUserDetail.module.css';
import { fetchUserById } from '../../../services/admin';
import { FaArrowLeft, FaEye } from 'react-icons/fa';

const AdminUserDetail = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserDetails = async () => {
            try {
                const data = await fetchUserById(userId);
                setUser(data);
            } catch (error) {
                console.error("Failed to fetch user details", error);
            } finally {
                setLoading(false);
            }
        };
        getUserDetails();
    }, [userId]);

    if (loading) {
        return <div className={styles.loading}>Loading user details...</div>;
    }

    if (!user) {
        return <div className={styles.container}>User not found.</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link to="/admin/users" className={styles.backButton}>
                    <FaArrowLeft /> Back to List
                </Link>
                <h1 className={styles.title}>User Details</h1>
            </header>
            
            <div className={styles.detailCard}>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Name:</strong> {user.name || 'N/A'}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Status:</strong> {user.isActive ? 'Active' : 'Inactive'}</p>
                <p><strong>Joined At:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>

            {user.itineraries && user.itineraries.length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>User's Itineraries ({user.itineraries.length})</h2>
                    <ul className={styles.itineraryList}>
                        {user.itineraries.map(itinerary => (
                            <li key={itinerary.id} className={styles.itineraryItem}>
                                <div className={styles.itineraryInfo}>
                                    <strong>{itinerary.title}</strong>
                                    <span>- {itinerary.destination} ({itinerary.visibility})</span>
                                </div>
                                <Link to={`/admin/itineraries/${itinerary.id}`} className={styles.viewButton}>
                                    <FaEye /> View
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AdminUserDetail;
