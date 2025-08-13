import React, { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import styles from './ActivityFormModal.module.css';

const toISODate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (dateString) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit' };
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', options).format(date);
};

const ActivityFormModal = ({
  show,
  onClose,
  onSave,
  activityData,
  itineraryId,
  itineraryStartDate,
  itineraryEndDate,
}) => {
  const [name, setName] = useState(activityData?.name || '');
  const [date, setDate] = useState(
    activityData?.date ? toISODate(activityData.date) : ''
  );
  const [startTime, setStartTime] = useState(activityData?.startTime || '');
  const [location, setLocation] = useState(activityData?.location || '');
  const [description, setDescription] = useState(activityData?.description || '');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const dateOptions = useMemo(() => {
    if (!itineraryStartDate || !itineraryEndDate) return [];

    const options = [];
    const currentDate = new Date(itineraryStartDate);
    const endDate = new Date(itineraryEndDate);

    while (currentDate <= endDate) {
      const isoDate = toISODate(currentDate);
      const displayDate = formatDateForDisplay(currentDate);
      options.push({ value: isoDate, label: displayDate });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return options;
  }, [itineraryStartDate, itineraryEndDate]);

  useEffect(() => {
    if (activityData) {
      setName(activityData.name || '');
      setDate(activityData.date ? toISODate(activityData.date) : '');
      setStartTime(activityData.startTime || '');
      setLocation(activityData.location || '');
      setDescription(activityData.description || '');
    } else {
      setName('');
      setDate('');
      setStartTime('');
      setLocation('');
      setDescription('');
    }
    setFormError(null);
  }, [activityData, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    if (!name || !date) {
      setFormError('Activity name and date are required.');
      setSaving(false);
      return;
    }

    if (!dateOptions.some(option => option.value === date)) {
        setFormError('Please select a valid date from the list.');
        setSaving(false);
        return;
    }

    try {
      await onSave({
        id: activityData?.id,
        itineraryId,
        name,
        date,
        startTime,
        location,
        description,
      });
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to save activity.');
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <h3 className={styles.modalTitle}>
          {activityData ? 'Edit Activity' : 'Add New Activity'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="activityName" className={styles.label}>
              Activity Name:
            </label>
            <input
              type="text"
              id="activityName"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="activityDate" className={styles.label}>
              Date:
            </label>
            <select
              id="activityDate"
              className={`${styles.input} ${styles.select}`}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            >
              <option value="" disabled>Select a date...</option>
              {dateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="activityStartTime" className={styles.label}>
              Start Time (HH:MM):
            </label>
            <input
              type="time"
              id="activityStartTime"
              className={styles.input}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="activityLocation" className={styles.label}>
              Location:
            </label>
            <input
              type="text"
              id="activityLocation"
              className={styles.input}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="activityDescription" className={styles.label}>
              Description:
            </label>
            <textarea
              id="activityDescription"
              className={`${styles.input} ${styles.textarea}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          {formError && (
            <p className={styles.formError}>{formError}</p>
          )}
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={saving}
            >
              {saving ? (
                <svg className={styles.spinner} viewBox="0 0 24 24">
                  <circle className={styles.spinnerPath} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className={styles.spinnerSegment} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {activityData ? (saving ? 'Saving...' : 'Update') : (saving ? 'Adding...' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityFormModal;
