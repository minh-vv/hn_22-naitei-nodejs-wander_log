import React, { useState } from "react";
import styles from "./Header.module.css";
import avatarDefault from "../../assets/images/default_avatar.png";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, isLoggedIn, logout } = useAuth();
  const { currentUser } = useUser();

  const toggleUserMenu = () => setIsMenuOpen(!isMenuOpen);

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
            <a href="/itineraries/new" className={styles.navLink}>
              Tạo lịch trình
            </a>
            <a href="/search" className={styles.navLink}>
              Tìm kiếm
            </a>
          </nav>

          <div className={styles.actionsContainer}>
            {isLoggedIn ? (
              <>
                <button className={styles.notificationButton}>
                  <i className="ri-notification-line"></i>
                  <span className={styles.notificationBadge}></span>
                </button>

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
                      <a href="/notifications" className={styles.dropdownItem}>
                        Thông báo
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
