import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import itineraryService from '../../../services/itinerary';
import { Plus, Edit, ArrowLeft } from 'lucide-react';
import styles from './ItineraryForm.module.css';

const ItineraryForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    visibility: 'PRIVATE',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      const fetchItinerary = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('userToken');
          if (!token) {
            navigate('/signin');
            return;
          }
          const itinerary = await itineraryService.getItineraryById(id, token);
          setFormData({
            ...itinerary,
            startDate: itinerary.startDate.split('T')[0],
            endDate: itinerary.endDate.split('T')[0],
            budget: itinerary.budget !== null ? itinerary.budget : '',
            visibility: itinerary.visibility,
          });
        } catch (err) {
          setError('Failed to load itinerary for editing.');
        } finally {
          setLoading(false);
        }
      };
      fetchItinerary();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'PUBLIC' : 'PRIVATE') : value, 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');

    const dataToSend = {
      title: formData.title,
      destination: formData.destination,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      budget: formData.budget !== '' ? Number(formData.budget) : null,
      visibility: formData.visibility,
    };

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        navigate('/signin');
        return;
      }
      if (isEditing) {
        await itineraryService.updateItinerary(id, dataToSend, token);
        setMessage('Itinerary updated successfully!');
      } else {
        await itineraryService.createItinerary(dataToSend, token);
        setMessage('Itinerary created successfully!');
      }
      setTimeout(() => navigate('/itineraries'), 2000);
    } catch (err) {
      setError(`Error: ${err.message || 'Failed to save itinerary.'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <h2 className={styles.title}>Loading Itinerary...</h2>
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
          <h2 className={styles.title}>{isEditing ? 'Edit Itinerary' : 'Create New Itinerary'}</h2>
        </div>

        {message && <p className={styles.success}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Itinerary Name:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="destination">Destination:</label>
            <input type="text" id="destination" name="destination" value={formData.destination} onChange={handleChange}
              className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="startDate">Start Date:</label>
            <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required
              className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="endDate">End Date:</label>
            <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} required
              className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="budget">Estimated Budget:</label>
            <input type="number" id="budget" name="budget" value={formData.budget} onChange={handleChange}
              className={styles.input} />
          </div>
          <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
            <input
              type="checkbox"
              id="visibility"
              name="visibility"
              checked={formData.visibility === 'PUBLIC'}
              onChange={handleChange}
              className={styles.checkbox} />
            <label htmlFor="visibility">Make Public</label>
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Saving...' : (
              <>
                {isEditing ? <Edit size={20} className={styles.buttonIcon} /> : <Plus size={20} className={styles.buttonIcon} />}
                {isEditing ? 'Update' : 'Create'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ItineraryForm;
