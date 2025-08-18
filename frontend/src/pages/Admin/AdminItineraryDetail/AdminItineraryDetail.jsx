import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './AdminItineraryDetail.module.css';
import { fetchItineraryById } from '../../../services/admin';
import { FaArrowLeft, FaEye } from 'react-icons/fa';

const AdminItineraryDetail = () => {
    const { itineraryId } = useParams();
    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getItinerary = async () => {
            try {
                const data = await fetchItineraryById(itineraryId);
                setItinerary(data);
            } catch (error) {
                console.error("Failed to fetch itinerary details", error);
            } finally {
                setLoading(false);
            }
        };
        getItinerary();
    }, [itineraryId]);

    if (loading) {
        return <div className={styles.loading}>Loading itinerary details...</div>;
    }

    if (!itinerary) {
        return <div className={styles.container}>Itinerary not found.</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link to="/admin/itineraries" className={styles.backButton}>
                    <FaArrowLeft /> Back to List
                </Link>
                <h1 className={styles.title}>{itinerary.title}</h1>
                <p className={styles.subtitle}>
                    By: 
                    <Link to={`/admin/users/${itinerary.user.id}`} className={styles.userLink}>
                        <FaEye /> {itinerary.user.name || itinerary.user.email}
                    </Link>
                </p>
            </header>
            
            <div className={styles.detailCard}>
                <p><strong>Destination:</strong> {itinerary.destination}</p>
                <p><strong>Dates:</strong> {new Date(itinerary.startDate).toLocaleDateString()} to {new Date(itinerary.endDate).toLocaleDateString()}</p>
                <p><strong>Budget:</strong> ${itinerary.budget}</p>
                <p><strong>Visibility:</strong> {itinerary.visibility}</p>
            </div>

            {itinerary.activities && itinerary.activities.length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Activities</h2>
                    <ul className={styles.list}>
                        {itinerary.activities.map(activity => (
                            <li key={activity.id} className={styles.listItem}>
                                <strong>{activity.name}</strong> - {activity.location}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {itinerary.posts && itinerary.posts.length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Posts</h2>
                    <ul className={styles.list}>
                        {itinerary.posts.map(post => (
                            <li key={post.id} className={styles.listItem}>
                                {post.content}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AdminItineraryDetail;
