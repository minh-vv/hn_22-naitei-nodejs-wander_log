import React, { useState, useEffect } from 'react';
import styles from './StarRating.module.css';

const StarRating = ({ initialRating, onRate, disabled }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [rating, setRating] = useState(initialRating || 0);
  
  useEffect(() => {
    setRating(initialRating || 0);
  }, [initialRating]);

  const handleRate = (value) => {
    if (disabled) return;
    setRating(value);
    onRate(value);
  };

  const stars = [...Array(5)].map((_, index) => {
    const starValue = index + 1;
    return (
      <span
        key={starValue}
        className={`${styles.star} ${
          starValue <= (hoverRating || rating) ? styles.filled : ''
        }`}
        onClick={() => handleRate(starValue)}
        onMouseEnter={() => setHoverRating(starValue)}
        onMouseLeave={() => setHoverRating(0)}
      >
        ★
      </span>
    );
  });

  return <div className={styles.starRating}>{stars}</div>;
};

export default StarRating;
