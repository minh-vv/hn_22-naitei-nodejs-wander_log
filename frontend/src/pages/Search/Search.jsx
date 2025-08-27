import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../component/Header/Header";
import searchService from "../../services/search";
import styles from "./Search.module.css";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [results, setResults] = useState({
    users: { data: [], total: 0, page: 1, totalPages: 0 },
    itineraries: { data: [], total: 0, page: 1, totalPages: 0 },
    locations: { data: [], total: 0, page: 1, totalPages: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const queryParam = searchParams.get("query");
    const pageParam = searchParams.get("page");
    if (queryParam) {
      setQuery(queryParam);
      const page = parseInt(pageParam) || 1;
      setCurrentPage(page);
      performSearch(queryParam, page);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery, page = 1) => {
    if (!searchQuery.trim()) {
      setResults({
        users: { data: [], total: 0, page: 1, totalPages: 0 },
        itineraries: { data: [], total: 0, page: 1, totalPages: 0 },
        locations: { data: [], total: 0, page: 1, totalPages: 0 },
      });
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchService.search(
        searchQuery,
        page,
        itemsPerPage
      );
      setResults(searchResults);
    } catch (error) {
      console.error("Search failed:", error);
      setResults({
        users: { data: [], total: 0, page: 1, totalPages: 0 },
        itineraries: { data: [], total: 0, page: 1, totalPages: 0 },
        locations: { data: [], total: 0, page: 1, totalPages: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setCurrentPage(1);
      setSearchParams({ query: query.trim(), page: 1 });
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSearchParams({ query, page: newPage });
  };

  const handleUserClick = (userId) => {
    window.location.href = `/profile/${userId}`;
  };

  const handleItineraryClick = (itinerarySlug) => {
    window.location.href = `/itineraries/${itinerarySlug}`;
  };

  const filteredResults = () => {
    switch (activeTab) {
      case "users":
        return {
          users: results.users,
          itineraries: { data: [], total: 0, page: 1, totalPages: 0 },
          locations: { data: [], total: 0, page: 1, totalPages: 0 },
        };
      case "itineraries":
        return {
          users: { data: [], total: 0, page: 1, totalPages: 0 },
          itineraries: results.itineraries,
          locations: { data: [], total: 0, page: 1, totalPages: 0 },
        };
      case "locations":
        return {
          users: { data: [], total: 0, page: 1, totalPages: 0 },
          itineraries: { data: [], total: 0, page: 1, totalPages: 0 },
          locations: results.locations,
        };
      default:
        return results;
    }
  };

  const currentResults = filteredResults();
  const totalResults =
    results.users.total + results.itineraries.total + results.locations.total;

  const getCurrentPagination = () => {
    switch (activeTab) {
      case "users":
        return results.users;
      case "itineraries":
        return results.itineraries;
      case "locations":
        return results.locations;
      default:
        const maxResult = [
          results.users,
          results.itineraries,
          results.locations,
        ].sort((a, b) => b.total - a.total)[0];
        return maxResult;
    }
  };

  const currentPagination = getCurrentPagination();

  return (
    <div className={styles.searchPage}>
      <Header />
      <div className={styles.container}>
        <div className={styles.searchSection}>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <div className={styles.searchInputGroup}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm người dùng, lịch trình, hoặc địa điểm..."
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                <i className="ri-search-line"></i>
              </button>
            </div>
          </form>
        </div>

        {query && (
          <>
            <div className={styles.tabsContainer}>
              <button
                className={`${styles.tab} ${
                  activeTab === "all" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("all")}
              >
                Tất cả ({totalResults})
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "users" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("users")}
              >
                Người dùng ({results.users.total})
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "itineraries" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("itineraries")}
              >
                Lịch trình ({results.itineraries.total})
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "locations" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("locations")}
              >
                Địa điểm ({results.locations.total})
              </button>
            </div>

            <div className={styles.resultsSection}>
              {loading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner}></div>
                  <p>Đang tìm kiếm...</p>
                </div>
              ) : (
                <>
                  {currentResults.users.data.length > 0 && (
                    <div className={styles.resultGroup}>
                      <h3 className={styles.resultGroupTitle}>Người dùng</h3>
                      <div className={styles.userResults}>
                        {currentResults.users.data.map((user) => (
                          <div
                            key={user.id}
                            className={styles.userCard}
                            onClick={() => handleUserClick(user.id)}
                          >
                            <img
                              src={user.avatar || "/default-avatar.png"}
                              alt={user.name}
                              className={styles.userAvatar}
                            />
                            <div className={styles.userInfo}>
                              <h4 className={styles.userName}>{user.name}</h4>
                              {user.bio && (
                                <p className={styles.userBio}>{user.bio}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentResults.itineraries.data.length > 0 && (
                    <div className={styles.resultGroup}>
                      <h3 className={styles.resultGroupTitle}>Lịch trình</h3>
                      <div className={styles.itineraryResults}>
                        {currentResults.itineraries.data.map((itinerary) => (
                          <div
                            key={itinerary.id}
                            className={styles.itineraryCard}
                            onClick={() => handleItineraryClick(itinerary.slug)}
                          >
                            {itinerary.coverImage && (
                              <img
                                src={itinerary.coverImage}
                                alt={itinerary.title}
                                className={styles.itineraryCover}
                              />
                            )}
                            <div className={styles.itineraryInfo}>
                              <h4 className={styles.itineraryTitle}>
                                {itinerary.title}
                              </h4>
                              {itinerary.destination && (
                                <p className={styles.itineraryDestination}>
                                  <i className="ri-map-pin-line"></i>
                                  {itinerary.destination}
                                </p>
                              )}
                              <p className={styles.itineraryDates}>
                                {new Date(
                                  itinerary.startDate
                                ).toLocaleDateString("vi-VN")}{" "}
                                -{" "}
                                {new Date(itinerary.endDate).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </p>
                              <div className={styles.itineraryAuthor}>
                                <img
                                  src={
                                    itinerary.user.avatar ||
                                    "/default-avatar.png"
                                  }
                                  alt={itinerary.user.name}
                                  className={styles.authorAvatar}
                                />
                                <span className={styles.authorName}>
                                  {itinerary.user.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentResults.locations.data.length > 0 && (
                    <div className={styles.resultGroup}>
                      <h3 className={styles.resultGroupTitle}>Địa điểm</h3>
                      <div className={styles.locationResults}>
                        {currentResults.locations.data.map(
                          (location, index) => (
                            <div key={index} className={styles.locationCard}>
                              <div className={styles.locationIcon}>
                                <i className="ri-map-pin-line"></i>
                              </div>
                              <div className={styles.locationInfo}>
                                <h4 className={styles.locationName}>
                                  {location.name}
                                </h4>
                                <p className={styles.locationType}>Địa điểm</p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {totalResults === 0 && !loading && (
                    <div className={styles.noResults}>
                      <div className={styles.noResultsIcon}>
                        <i className="ri-search-line"></i>
                      </div>
                      <h3>Không tìm thấy kết quả</h3>
                      <p>Thử tìm kiếm với từ khóa khác</p>
                    </div>
                  )}

                  {totalResults > 0 && currentPagination.totalPages > 1 && (
                    <div className={styles.pagination}>
                      <button
                        className={`${styles.pageButton} ${
                          currentPage === 1 ? styles.disabled : ""
                        }`}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="ri-arrow-left-line"></i>
                        Trước
                      </button>

                      <div className={styles.pageNumbers}>
                        {Array.from(
                          { length: currentPagination.totalPages },
                          (_, i) => i + 1
                        )
                          .filter((page) => {
                            return (
                              page === 1 ||
                              page === currentPagination.totalPages ||
                              Math.abs(page - currentPage) <= 2
                            );
                          })
                          .map((page, index, array) => {
                            const showEllipsis =
                              index > 0 && page - array[index - 1] > 1;
                            return (
                              <React.Fragment key={page}>
                                {showEllipsis && (
                                  <span className={styles.ellipsis}>...</span>
                                )}
                                <button
                                  className={`${styles.pageNumber} ${
                                    page === currentPage ? styles.active : ""
                                  }`}
                                  onClick={() => handlePageChange(page)}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            );
                          })}
                      </div>

                      <button
                        className={`${styles.pageButton} ${
                          currentPage === currentPagination.totalPages
                            ? styles.disabled
                            : ""
                        }`}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === currentPagination.totalPages}
                      >
                        Sau
                        <i className="ri-arrow-right-line"></i>
                      </button>
                    </div>
                  )}

                  {totalResults > 0 && (
                    <div className={styles.pageInfo}>
                      Hiển thị{" "}
                      {Math.min(
                        (currentPage - 1) * itemsPerPage + 1,
                        totalResults
                      )}{" "}
                      - {Math.min(currentPage * itemsPerPage, totalResults)}{" "}
                      trong tổng số {totalResults} kết quả
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
