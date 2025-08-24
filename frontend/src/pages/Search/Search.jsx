import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../component/Header/Header";
import searchService from "../../services/search";
import styles from "./Search.module.css";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [results, setResults] = useState({
    users: [],
    itineraries: [],
    locations: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const queryParam = searchParams.get("query");
    if (queryParam) {
      setQuery(queryParam);
      performSearch(queryParam);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ users: [], itineraries: [], locations: [] });
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchService.search(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error("Search failed:", error);
      setResults({ users: [], itineraries: [], locations: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ query: query.trim() });
    }
  };

  const handleUserClick = (userId) => {
    window.location.href = `/profile/${userId}`;
  };

  const handleItineraryClick = (itineraryId) => {
    window.location.href = `/itineraries/${itineraryId}`;
  };

  const filteredResults = () => {
    switch (activeTab) {
      case "users":
        return { users: results.users, itineraries: [], locations: [] };
      case "itineraries":
        return { users: [], itineraries: results.itineraries, locations: [] };
      case "locations":
        return { users: [], itineraries: [], locations: results.locations };
      default:
        return results;
    }
  };

  const currentResults = filteredResults();
  const totalResults = results.users.length + results.itineraries.length + results.locations.length;

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
                className={`${styles.tab} ${activeTab === "all" ? styles.active : ""}`}
                onClick={() => setActiveTab("all")}
              >
                Tất cả ({totalResults})
              </button>
              <button
                className={`${styles.tab} ${activeTab === "users" ? styles.active : ""}`}
                onClick={() => setActiveTab("users")}
              >
                Người dùng ({results.users.length})
              </button>
              <button
                className={`${styles.tab} ${activeTab === "itineraries" ? styles.active : ""}`}
                onClick={() => setActiveTab("itineraries")}
              >
                Lịch trình ({results.itineraries.length})
              </button>
              <button
                className={`${styles.tab} ${activeTab === "locations" ? styles.active : ""}`}
                onClick={() => setActiveTab("locations")}
              >
                Địa điểm ({results.locations.length})
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
                  {currentResults.users.length > 0 && (
                    <div className={styles.resultGroup}>
                      <h3 className={styles.resultGroupTitle}>Người dùng</h3>
                      <div className={styles.userResults}>
                        {currentResults.users.map((user) => (
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

                  {currentResults.itineraries.length > 0 && (
                    <div className={styles.resultGroup}>
                      <h3 className={styles.resultGroupTitle}>Lịch trình</h3>
                      <div className={styles.itineraryResults}>
                        {currentResults.itineraries.map((itinerary) => (
                          <div
                            key={itinerary.id}
                            className={styles.itineraryCard}
                            onClick={() => handleItineraryClick(itinerary.id)}
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
                                {new Date(itinerary.startDate).toLocaleDateString("vi-VN")} - {new Date(itinerary.endDate).toLocaleDateString("vi-VN")}
                              </p>
                              <div className={styles.itineraryAuthor}>
                                <img
                                  src={itinerary.user.avatar || "/default-avatar.png"}
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

                  {currentResults.locations.length > 0 && (
                    <div className={styles.resultGroup}>
                      <h3 className={styles.resultGroupTitle}>Địa điểm</h3>
                      <div className={styles.locationResults}>
                        {currentResults.locations.map((location, index) => (
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
                        ))}
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
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}