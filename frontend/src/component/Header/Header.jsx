import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Header.module.css";
import avatarDefault from "../../assets/images/default_avatar.png";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import NotificationDropdown from "../Notification/NotificationDropdown";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { user, isLoggedIn, logout } = useAuth();
  const { currentUser } = useUser();

  const toggleUserMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.flexContainer}>
          <div className={styles.logoContainer}>
            <Link to="/home" className={styles.logoLink}>
              <div>
                <img
                  src="/logo.png"
                  alt="WanderLog Logo"
                  className={styles.logoIconWrapper}
                />
              </div>
            </Link>
          </div>

          <nav className={styles.desktopNav}>
            <Link to="/home" className={styles.navLink}>
              Trang chủ
            </Link>
            <Link to="/posts/feed" className={styles.navLink}>
              Bảng tin
            </Link>
            <Link to="/itineraries/new" className={styles.navLink}>
              Tạo lịch trình
            </Link>
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

                <div className={styles.userMenu}>
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
    </header>
  );
}
