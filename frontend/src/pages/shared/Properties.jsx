import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineAdjustments,
  HiOutlineSearch,
  HiX,
  HiOutlineHome,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import PropertyCard from "../../components/common/PropertyCard.jsx";
import { propertiesStyles as s } from "../../assets/dummyStyles.js";

const Properties = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, API_URL } = useAuth();

  const [properties, setProperties] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Initialize filters from URL search params
  const searchParams = new URLSearchParams(location.search);
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    propertyType: searchParams.get("propertyType")
      ? searchParams.get("propertyType").split(",")
      : [],
    bhk: searchParams.get("bhk") || "",
    maxPrice: Number(searchParams.get("maxPrice")) || 100000000,
    minPrice: Number(searchParams.get("minPrice")) || 0,
    furnishing: searchParams.get("furnishing")
      ? searchParams.get("furnishing").split(",")
      : [],
    sort: searchParams.get("sort") || "latest",
  });

  const propertyTypes = [
    { label: "Flat/Apartment", value: "flat" },
    { label: "Independent House/Villa", value: "villa" },
    { label: "Penthouse", value: "penthouse" },
    { label: "Commercial", value: "commercial" },
  ];

  const bhkOptions = ["1", "2", "3", "4", "5+"];

  const furnishingOptions = [
    { label: "Furnished", value: "furnished" },
    { label: "Semi-Furnished", value: "semi-furnished" },
    { label: "Unfurnished", value: "unfurnished" },
  ];

  const fetchProperties = async (currentFilters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentFilters.city) params.append("city", currentFilters.city);
      if (currentFilters.propertyType.length > 0)
        params.append("propertyType", currentFilters.propertyType.join(","));
      if (currentFilters.bhk) params.append("bhk", currentFilters.bhk);
      if (currentFilters.maxPrice)
        params.append("maxPrice", currentFilters.maxPrice);
      if (currentFilters.minPrice)
        params.append("minPrice", currentFilters.minPrice);
      if (currentFilters.furnishing && currentFilters.furnishing.length > 0)
        params.append("furnishing", currentFilters.furnishing.join(","));
      if (currentFilters.sort) params.append("sort", currentFilters.sort);

      const res = await axios.get(`${API_URL}/api/property?${params.toString()}`);
      if (res.data?.success) {
        setProperties(res.data.properties || []);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load properties. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTimer = useRef(null);
  const debouncedFetch = (updatedFilters) => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    fetchTimer.current = setTimeout(() => {
      fetchProperties(updatedFilters);
    }, 400);
  };

  useEffect(() => {
    fetchProperties(filters);

    if (token) {
      axios
        .get(`${API_URL}/api/wishlist`)
        .then((res) => {
          if (res.data?.success) {
            setWishlistedIds((res.data.wishlist || []).map((p) => String(p._id)));
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const handleToggleWishlist = async (propertyId) => {
    if (!token) {
      navigate("/login");
      return;
    }
    const idStr = String(propertyId);
    const isSaved = wishlistedIds.includes(idStr);

    try {
      if (isSaved) {
        await axios.delete(`${API_URL}/api/wishlist/${idStr}`);
        setWishlistedIds((prev) => prev.filter((id) => id !== idStr));
      } else {
        await axios.post(`${API_URL}/api/wishlist/${idStr}`);
        setWishlistedIds((prev) => [...prev, idStr]);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  const handleCityChange = (e) => {
    const val = e.target.value;
    const updated = { ...filters, city: val };
    setFilters(updated);
    debouncedFetch(updated);
  };

  const handleCheckboxChange = (category, value) => {
    const current = [...(filters[category] || [])];
    const index = current.indexOf(value);
    if (index === -1) {
      current.push(value);
    } else {
      current.splice(index, 1);
    }
    const updated = { ...filters, [category]: current };
    setFilters(updated);
    fetchProperties(updated);
  };

  const handleBhkSelect = (value) => {
    const updated = {
      ...filters,
      bhk: filters.bhk === value ? "" : value,
    };
    setFilters(updated);
    fetchProperties(updated);
  };

  const handlePriceChange = (e) => {
    const val = Number(e.target.value);
    const updated = { ...filters, maxPrice: val };
    setFilters(updated);
    debouncedFetch(updated);
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    const updated = { ...filters, sort: val };
    setFilters(updated);
    fetchProperties(updated);
  };

  const resetFilters = () => {
    const reset = {
      city: "",
      propertyType: [],
      bhk: "",
      maxPrice: 100000000,
      minPrice: 0,
      furnishing: [],
      sort: "latest",
    };
    setFilters(reset);
    navigate("/properties");
    fetchProperties(reset);
  };

  return (
    <div className={s.pageContainer}>
      <div className={s.container}>
        {/* Mobile Filter Toggle */}
        <div className={s.mobileFilterButtonWrapper}>
          <button
            onClick={() => setShowMobileFilters(true)}
            className={s.mobileFilterButton}
          >
            <HiOutlineAdjustments size={20} />
            <span>Show Filters</span>
          </button>
        </div>

        {/* Mobile Backdrop */}
        {showMobileFilters && (
          <div
            className={s.mobileOverlay}
            onClick={() => setShowMobileFilters(false)}
          />
        )}

        <div className={s.layout}>
          {/* Filters Sidebar */}
          <aside
            className={`${s.sidebar} ${
              showMobileFilters ? s.sidebarVisible : s.sidebarHidden
            }`}
          >
            <div className={s.sidebarHeader}>
              <div className={s.sidebarTitleWrapper}>
                <HiOutlineAdjustments size={22} className={s.sidebarTitleIcon} />
                <h3 className={s.sidebarTitle}>Filters</h3>
              </div>
              <div className={s.sidebarHeaderActions}>
                <button onClick={resetFilters} className={s.resetButton}>
                  Reset All
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className={s.closeMobileFilters}
                >
                  <HiX size={20} />
                </button>
              </div>
            </div>

            <div className={s.filtersScrollArea}>
              {/* Location Filter */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Location / City</label>
                <div className={s.searchInputWrapper}>
                  <HiOutlineSearch size={18} className={s.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search city, area..."
                    value={filters.city}
                    onChange={handleCityChange}
                    className={s.searchInput}
                  />
                </div>
              </div>

              {/* Price Range Slider */}
              <div className={s.filterSection}>
                <div className={s.priceHeader}>
                  <label className={s.filterLabel}>Max Price</label>
                  <span className={s.priceValue}>
                    {filters.maxPrice >= 10000000
                      ? `₹${(filters.maxPrice / 10000000).toFixed(2)} Cr`
                      : `₹${(filters.maxPrice / 100000).toFixed(1)} L`}
                  </span>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="100000000"
                  step="500000"
                  value={filters.maxPrice}
                  onChange={handlePriceChange}
                  className={s.priceSlider}
                />
                <div className={s.priceLabels}>
                  <span>₹5L</span>
                  <span>₹10Cr</span>
                </div>
              </div>

              {/* BHK Selection */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Bedrooms (BHK)</label>
                <div className={s.bhkGroup}>
                  {bhkOptions.map((bhk) => (
                    <button
                      key={bhk}
                      type="button"
                      onClick={() => handleBhkSelect(bhk)}
                      className={`${s.bhkButton} ${
                        filters.bhk === bhk
                          ? s.bhkButtonActive
                          : s.bhkButtonInactive
                      }`}
                    >
                      {bhk} BHK
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type Checkboxes */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Property Type</label>
                <div className={s.checkboxGroup}>
                  {propertyTypes.map((type) => (
                    <label key={type.value} className={s.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={filters.propertyType.includes(type.value)}
                        onChange={() =>
                          handleCheckboxChange("propertyType", type.value)
                        }
                        className={s.checkbox}
                      />
                      <span>{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Furnishing Checkboxes */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Furnishing</label>
                <div className={s.checkboxGroup}>
                  {furnishingOptions.map((opt) => (
                    <label key={opt.value} className={s.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={filters.furnishing.includes(opt.value)}
                        onChange={() =>
                          handleCheckboxChange("furnishing", opt.value)
                        }
                        className={s.checkbox}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className={s.mainContent}>
            {/* Header Controls */}
            <div className={s.contentHeader}>
              <div className={s.resultCount}>
                Showing <strong className={s.resultCountStrong}>{properties.length}</strong> verified properties
              </div>

              <div className={s.headerControls}>
                <div className={s.sortControl}>
                  <span className={s.sortLabel}>Sort By:</span>
                  <select
                    value={filters.sort}
                    onChange={handleSortChange}
                    className={s.sortSelect}
                  >
                    <option value="latest">Newest First</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Properties Grid */}
            {loading ? (
              <div className={s.skeletonGrid}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={s.skeletonCard} />
                ))}
              </div>
            ) : error ? (
              <div className={s.errorContainer}>
                <p className="text-red-600 mb-4">{error}</p>
                <button onClick={() => fetchProperties(filters)} className={s.errorButton}>
                  Retry Search
                </button>
              </div>
            ) : properties.length === 0 ? (
              <div className={s.emptyContainer}>
                <div className={s.emptyIconWrapper}>
                  <HiOutlineHome size={36} className={s.emptyIcon} />
                </div>
                <h3 className={s.emptyTitle}>No matching properties found</h3>
                <p className={s.emptyText}>
                  Try relaxing your price filters or removing specific keywords to explore more options.
                </p>
                <button onClick={resetFilters} className={s.emptyButton}>
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={`${s.propertyList} ${s.propertyListGrid}`}>
                {properties.map((prop) => (
                  <PropertyCard
                    key={prop._id}
                    property={prop}
                    isWishlisted={wishlistedIds.includes(String(prop._id))}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Properties;
