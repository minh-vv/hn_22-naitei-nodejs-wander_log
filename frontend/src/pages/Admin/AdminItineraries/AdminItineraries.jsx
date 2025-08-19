import React, { useState, useEffect } from 'react';
import styles from './AdminItineraries.module.css';
import { fetchItineraries } from '../../../services/admin';

const AdminItineraries = () => {
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getItineraries();
    }, []);

    const getItineraries = async () => {
        try {
            const data = await fetchItineraries();
            setItineraries(data);
        } catch (error) {
            console.error("Failed to fetch itineraries", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading itineraries...</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Manage Itineraries</h1>
                <p className={styles.subtitle}>Admin Panel</p>
            </header>
            
            <div className={styles.tableContainer}>
                <table className={styles.itineraryTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>User</th>
                            <th>Destination</th>
                            <th>Start Date</th>
                            <th>Visibility</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itineraries.map(itinerary => (
                            <tr key={itinerary.id}>
                                <td>{itinerary.id}</td>
                                <td>{itinerary.title}</td>
                                <td>{itinerary.user.name || itinerary.user.email}</td>
                                <td>{itinerary.destination}</td>
                                <td>{new Date(itinerary.startDate).toLocaleDateString()}</td>
                                <td>{itinerary.visibility}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminItineraries;
