import React, { useState } from "react";
import styles from "./SearchFilter.module.css";

const COUNTRIES = [
  "Việt Nam", "Thái Lan", "Singapore", "Malaysia", "Indonesia",
  "Philippines", "Campuchia", "Lào", "Myanmar", "Brunei",
  
  "Trung Quốc", "Nhật Bản", "Hàn Quốc", "Đài Loan", "Hong Kong", "Macau",
  
  "Ấn Độ", "Nepal", "Bhutan", "Sri Lanka", "Maldives", "Bangladesh",
  
  "UAE", "Qatar", "Oman", "Kuwait", "Bahrain", "Saudi Arabia",
  "Jordan", "Israel", "Thổ Nhĩ Kỳ", "Iran", "Georgia", "Armenia",
  
  "Pháp", "Ý", "Tây Ban Nha", "Đức", "Anh", "Hà Lan",
  "Thụy Sĩ", "Áo", "Bồ Đào Nha", "Hy Lạp", "Na Uy", "Thụy Điển",
  "Đan Mạch", "Phần Lan", "Iceland", "Bỉ", "Luxembourg", "Ireland",
  "Séc", "Hungary", "Ba Lan", "Croatia", "Slovenia", "Slovakia",
  "Bulgaria", "Romania", "Estonia", "Latvia", "Lithuania",
  "Nga", "Ukraine", "Belarus",
  
  "Mỹ", "Canada", "Mexico", "Guatemala", "Costa Rica", "Panama",
  "Cuba", "Jamaica", "Dominican Republic", "Puerto Rico",
  "Brazil", "Argentina", "Chile", "Peru", "Colombia", "Ecuador",
  "Uruguay", "Paraguay", "Bolivia", "Venezuela",
  
  "Nam Phi", "Kenya", "Tanzania", "Uganda", "Rwanda", "Ethiopia",
  "Morocco", "Tunisia", "Egypt", "Ghana", "Nigeria", "Senegal",
  "Madagascar", "Mauritius", "Seychelles",
  
  "Australia", "New Zealand", "Fiji", "Tahiti", "Samoa", "Tonga",
  "Vanuatu", "Papua New Guinea", "Palau", "Guam"
];

const SearchFilter = ({ onFilter, onClear, isLoading, isFiltered = false, searchQuery = "" }) => {
  const [filters, setFilters] = useState({
    destination: "", // Independent from search query
    country: "",
    duration: "",
    budgetRange: "",
    budgetMin: "",
    budgetMax: "",
    minRating: "",
    tags: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const handleInputChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCountrySelect = (country) => {
    setFilters(prev => ({
      ...prev,
      country: country
    }));
    setShowCountryDropdown(false);
  };

  const applyFilters = () => {
    const filterParams = {};
    
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key].toString().trim() !== "") {
        filterParams[key] = filters[key];
      }
    });

    onFilter(filterParams);
  };

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 500); 

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const handleClear = () => {
    setFilters({
      destination: "",
      country: "",
      duration: "",
      budgetRange: "",
      budgetMin: "",
      budgetMax: "",
      minRating: "",
      tags: "",
      sortBy: "createdAt",
      sortOrder: "desc"
    });
    onClear();
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value && value.toString().trim() !== "" && value !== "createdAt" && value !== "desc"
  );

  const filteredCountries = COUNTRIES.filter(country =>
    country.toLowerCase().includes(filters.country.toLowerCase())
  );

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterHeader}>
        <button 
          type="button"
          className={styles.filterToggle}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <i className="ri-filter-3-line"></i>
          {searchQuery ? `Lọc kết quả "${searchQuery}"` : (isFiltered ? "Bộ lọc đang hoạt động" : "Bộ lọc nâng cao")}
          {(hasActiveFilters || isFiltered || searchQuery) && <span className={styles.activeIndicator}></span>}
          <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line ${styles.arrow}`}></i>
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.headerClearButton}
            title="Xóa tất cả bộ lọc"
          >
            <i className="ri-close-line"></i>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className={styles.filterContent}>
          {searchQuery && (
            <div className={styles.searchInfo}>
              <i className="ri-information-line"></i>
              <span>Lọc trong kết quả tìm kiếm: <strong>"{searchQuery}"</strong></span>
            </div>
          )}
          <div className={styles.filterForm}>
            <div className={styles.filterSections}>
              {/* Điểm đến */}
            <div className={styles.filterSection}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <i className="ri-map-pin-line"></i>
                  Điểm đến
                </label>
                <input
                  type="text"
                  value={filters.destination}
                  onChange={(e) => handleInputChange("destination", e.target.value)}
                  placeholder="Nhập điểm đến..."
                  className={styles.filterInput}
                />
              </div>
            </div>

            {/* Quốc gia */}
            <div className={styles.filterSection}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <i className="ri-global-line"></i>
                  Quốc gia
                </label>
                <div className={styles.selectContainer}>
                  <input
                    type="text"
                    value={filters.country}
                    onChange={(e) => {
                      handleInputChange("country", e.target.value);
                      setShowCountryDropdown(true);
                    }}
                    onFocus={() => setShowCountryDropdown(true)}
                    placeholder="Chọn quốc gia..."
                    className={styles.filterInput}
                  />
                  {showCountryDropdown && (
                    <div className={styles.dropdown}>
                      {filteredCountries.slice(0, 6).map((country, index) => (
                        <div
                          key={index}
                          className={styles.dropdownItem}
                          onClick={() => handleCountrySelect(country)}
                        >
                          {country}
                        </div>
                      ))}
                      {filteredCountries.length > 6 && (
                        <div className={styles.dropdownMore}>
                          +{filteredCountries.length - 6} khác...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Độ dài chuyến đi */}
            <div className={styles.filterSection}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <i className="ri-calendar-2-line"></i>
                  Độ dài chuyến đi
                </label>
                <select
                  value={filters.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Tất cả</option>
                  <option value="1-3">1-3 ngày</option>
                  <option value="4-7">4-7 ngày</option>
                  <option value="8-14">8-14 ngày</option>
                  <option value="15+">15+ ngày</option>
                </select>
              </div>
            </div>

            {/* Ngân sách */}
            <div className={styles.filterSection}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <i className="ri-money-dollar-circle-line"></i>
                  Ngân sách
                </label>
                <select
                  value={filters.budgetRange}
                  onChange={(e) => handleInputChange("budgetRange", e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Tất cả</option>
                  <option value="under-5">Dưới 5 triệu</option>
                  <option value="5-10">5-10 triệu</option>
                  <option value="10-20">10-20 triệu</option>
                  <option value="over-20">Trên 20 triệu</option>
                </select>
              </div>
            </div>

            {/* Ngân sách tùy chỉnh */}
            {(filters.budgetRange === '' || !filters.budgetRange) && (
              <div className={styles.filterSection}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>
                    <i className="ri-money-dollar-box-line"></i>
                    Tùy chỉnh (triệu VNĐ)
                  </label>
                  <div className={styles.verticalRangeInputs}>
                    <input
                      type="number"
                      value={filters.budgetMin}
                      onChange={(e) => handleInputChange("budgetMin", e.target.value)}
                      placeholder="Từ (triệu VNĐ)"
                      className={styles.rangeInput}
                      min="0"
                      step="0.5"
                    />
                    <input
                      type="number"
                      value={filters.budgetMax}
                      onChange={(e) => handleInputChange("budgetMax", e.target.value)}
                      placeholder="Đến (triệu VNĐ)"
                      className={styles.rangeInput}
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Đánh giá */}
            <div className={styles.filterSection}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <i className="ri-star-line"></i>
                  Đánh giá tối thiểu
                </label>
                <div className={styles.ratingSelect}>
                  {[3, 3.5, 4, 4.5, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      className={`${styles.ratingButton} ${
                        filters.minRating == rating ? styles.active : ""
                      }`}
                      onClick={() => handleInputChange("minRating", 
                        filters.minRating == rating ? "" : rating.toString()
                      )}
                    >
                      <span>{rating}⭐</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hoạt động */}
            <div className={styles.filterSection}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <i className="ri-price-tag-3-line"></i>
                  Hoạt động
                </label>
                <input
                  type="text"
                  value={filters.tags}
                  onChange={(e) => handleInputChange("tags", e.target.value)}
                  placeholder="du lịch, ẩm thực..."
                  className={styles.filterInput}
                />
              </div>
            </div>

            {/* Sắp xếp */}
            <div className={styles.filterSection}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <i className="ri-sort-desc"></i>
                  Sắp xếp theo
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleInputChange("sortBy", e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="createdAt">Mới nhất</option>
                  <option value="startDate">Ngày đi</option>
                  <option value="views">Lượt xem</option>
                  <option value="budget">Ngân sách</option>
                  <option value="rating">Đánh giá</option>
                </select>
              </div>
            </div>

            {/* Thứ tự */}
            <div className={styles.filterSection}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <i className="ri-arrow-up-down-line"></i>
                  Thứ tự
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleInputChange("sortOrder", e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="desc">Giảm dần</option>
                  <option value="asc">Tăng dần</option>
                </select>
              </div>
            </div>
            </div>

            {hasActiveFilters && (
              <div className={styles.clearAction}>
                <button
                  type="button"
                  onClick={handleClear}
                  className={styles.clearButton}
                >
                  <i className="ri-close-line"></i>
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showCountryDropdown && (
        <div 
          className={styles.overlay} 
          onClick={() => setShowCountryDropdown(false)}
        />
      )}
    </div>
  );
};

export default SearchFilter;
