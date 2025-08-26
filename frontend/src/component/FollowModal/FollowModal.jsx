import React from 'react';
import { Link } from 'react-router-dom';
import defaultAvatar from "../../assets/images/default_avatar.png";
import styles from './FollowModal.module.css';

const FollowModal = ({
    title,
    users,
    loading,
    error,
    onClose,
    onFollow,
    onUnfollow,
    currentUserId
}) => {
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{title}</h3>
                    <button className={styles.modalCloseButton} onClick={onClose}>&times;</button>
                </div>
                <div className={styles.modalBody}>
                    {loading && <p>Đang tải...</p>}
                    {error && <p className={styles.error}>{error}</p>}
                    {!loading && users.length === 0 && <p>Không có ai trong danh sách này.</p>}
                    {!loading && users.length > 0 && (
                        <ul className={styles.followList}>
                            {users.map(user => (
                                <li key={user.id} className={styles.followListItem}>
                                    <Link to={`/profile/${user.id}`} onClick={onClose}>
                                        <img
                                            src={user.avatar || defaultAvatar}
                                            alt={user.name}
                                            className={styles.followAvatar}
                                        />
                                        <div className={styles.userInfo}>
                                            <h4>{user.name || 'Người dùng'}</h4>
                                            <p>{user.bio}</p>
                                        </div>
                                    </Link>
                                    {user.id !== currentUserId && (
                                        <button
                                            className={user.isFollowing ? styles.unfollowButton : styles.followButton}
                                            onClick={() => user.isFollowing ? onUnfollow(user.id) : onFollow(user.id)}
                                        >
                                            {user.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowModal;
