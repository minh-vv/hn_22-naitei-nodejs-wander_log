import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import avatarDefault from "../../assets/images/default_avatar.png";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import NotificationDropdown from "../Notification/NotificationDropdown";
import ItineraryModal from "../ItineraryModal/ItineraryModal";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const { user, isLoggedIn, logout } = useAuth();
  const { currentUser } = useUser();

  const toggleUserMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleOpenCreateModal = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveSuccess = () => {
    window.alert("Lịch trình đã được tạo thành công!");
    window.location.reload();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.flexContainer}>
          <div className={styles.logoContainer}>
            <a href="/" className={styles.logoLink}>
              <div className={styles.logoIconWrapper}>
                <i className="ri-map-pin-line"></i>
              </div>
              <span className={styles.logoText}>WanderLog</span>
            </a>
          </div>

          <nav className={styles.desktopNav}>
            <a href="/home" className={styles.navLink}>
              Trang chủ
            </a>
            <a href="/posts/feed" className={styles.navLink}>
              Bảng tin
            </a>
            <a href="#" className={styles.navLink} onClick={handleOpenCreateModal}>
              Tạo lịch trình
            </a>
          </nav>

          <div className={styles.searchContainer}>
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <div className={styles.searchInputGroup}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className={styles.searchInput}
                />
                <button type="submit" className={styles.searchButton}>
                  <i className="ri-search-line"></i>
                </button>
              </div>
            </form>
          </div>

          <div className={styles.actionsContainer}>
            {isLoggedIn ? (
              <>
                <NotificationDropdown />

                <div className={styles.userMenu} ref={menuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className={styles.userMenuButton}
                  >
                    <img
                      src={currentUser?.avatar || user.avatar || avatarDefault}
                      alt="Avatar"
                      className={styles.avatar}
                    />
                    <i
                      className={`ri-arrow-down-s-line ${styles.dropdownIcon}`}
                    ></i>
                  </button>

                  {isMenuOpen && (
                    <div className={styles.dropdownMenu}>
                      <a href="/profile" className={styles.dropdownItem}>
                        Trang cá nhân
                      </a>
                      {user?.authProvider !== 'GOOGLE' && (
                        <a href="/change-password" className={styles.dropdownItem}>
                          Đổi mật khẩu
                        </a>
                      )}
                      <button
                        type="button"
                        className={styles.logoutButton}
                        onClick={logout}
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.authButtons}>
                <a href="/signin" className={styles.loginButton}>
                  Đăng nhập
                </a>
                <a href="/signup" className={styles.registerButton}>
                  Đăng ký
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      <ItineraryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSuccess}
        initialItineraryData={null}
      />
    </header>
  );
}
