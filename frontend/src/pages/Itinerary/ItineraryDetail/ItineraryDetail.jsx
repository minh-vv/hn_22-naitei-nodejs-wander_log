import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import itineraryService from '../../../services/itinerary';
import { Edit, Trash2, ArrowLeft, Calendar, MapPin, DollarSign, Eye, Globe } from 'lucide-react';
import moment from 'moment';
import styles from './ItineraryDetail.module.css';

const ItineraryDetail = () => {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          navigate('/signin');
          return;
        }
        const data = await itineraryService.getItineraryById(id, token);
        setItinerary(data);
      } catch (err) {
        setError('Failed to load itinerary details.');
      } finally {
        setLoading(false);
      }
    };
    fetchItinerary();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this itinerary? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          navigate('/signin');
          return;
        }
        await itineraryService.deleteItinerary(id, token);
        navigate('/itineraries');
      } catch (err) {
        setError('Failed to delete itinerary. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.message}>Itinerary not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => navigate('/itineraries')} className={styles.backButton}>
            <ArrowLeft size={24} />
          </button>
          <h1 className={styles.title}>{itinerary.name}</h1>
        </div>
        
        <div className={styles.detailCard}>
          <div className={styles.detailItem}>
            <MapPin size={24} className={styles.icon} />
            <div className={styles.detailContent}>
              <p className={styles.detailLabel}>Destination</p>
              <p className={styles.detailValue}>{itinerary.destination || 'Not specified'}</p>
            </div>
          </div>
          <div className={styles.detailItem}>
            <Calendar size={24} className={styles.icon} />
            <div className={styles.detailContent}>
              <p className={styles.detailLabel}>Dates</p>
              <p className={styles.detailValue}>
                {moment(itinerary.startDate).format('DD/MM/YYYY')} - {moment(itinerary.endDate).format('DD/MM/YYYY')}
              </p>
            </div>
          </div>
          <div className={styles.detailItem}>
            <DollarSign size={24} className={styles.icon} />
            <div className={styles.detailContent}>
              <p className={styles.detailLabel}>Budget</p>
              <p className={styles.detailValue}>{itinerary.budget ? `${itinerary.budget} VND` : 'Not specified'}</p>
            </div>
          </div>
          <div className={styles.detailItem}>
            {itinerary.isPublic ? (
              <>
                <Globe size={24} className={styles.icon} />
                <p className={styles.detailValue}>Public</p>
              </>
            ) : (
              <>
                <Eye size={24} className={styles.icon} />
                <p className={styles.detailValue}>Private</p>
              </>
            )}
          </div>
        </div>
        
        <div className={styles.actions}>
          <button
            onClick={() => navigate(`/itineraries/edit/${itinerary.id}`)}
            className={`${styles.actionButton} ${styles.editButton}`}
          >
            <Edit size={20} className={styles.buttonIcon} /> Edit
          </button>
          <button
            onClick={handleDelete}
            className={`${styles.actionButton} ${styles.deleteButton}`}
          >
            <Trash2 size={20} className={styles.buttonIcon} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDetail;
