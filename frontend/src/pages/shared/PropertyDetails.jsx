import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineLocationMarker,
  HiOutlineHome,
  HiOutlineCheckCircle,
  HiHeart,
  HiOutlineHeart,
  HiBadgeCheck,
  HiChatAlt,
  HiX,
  HiChevronLeft,
  HiChevronRight,
  HiCollection,
  HiCalendar,
  HiOutlineViewGrid,
} from "react-icons/hi";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext.jsx";
import PropertyCard from "../../components/common/PropertyCard.jsx";
import { propertyDetailsStyles as s } from "../../assets/dummyStyles.js";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, API_URL } = useAuth();

  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const [inquiry, setInquiry] = useState({
    message: "",
  });
  const [inquiryStatus, setInquiryStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/property/${id}`);
        if (res.data?.success) {
          setProperty(res.data.property);
          setSimilarProperties(res.data.similarProperties || []);
        } else {
          setError("Property not found");
        }

        // Check wishlist
        if (token) {
          try {
            const wishRes = await axios.get(`${API_URL}/api/wishlist`);
            if (wishRes.data?.success) {
              const ids = (wishRes.data.wishlist || []).map((p) => String(p._id));
              setIsInWishlist(ids.includes(String(id)));
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        console.error("Fetch property details error:", err);
        setError("Property not found or failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, token, API_URL]);

  const handleToggleWishlist = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (isInWishlist) {
        await axios.delete(`${API_URL}/api/wishlist/${id}`);
        setIsInWishlist(false);
      } else {
        await axios.post(`${API_URL}/api/wishlist/${id}`);
        setIsInWishlist(true);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  const handleChatStart = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (property?.seller?._id === user?._id) {
      alert("You cannot start a chat with yourself.");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/chat/start`, {
        propertyId: property._id,
        sellerId: property.seller._id,
      });

      if (res.data?.success) {
        navigate("/chat-messages");
      }
    } catch (err) {
      console.error("Chat start error:", err);
      alert("Could not start chat. Please try again.");
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }

    setInquiryStatus({ loading: true, success: false, error: null });
    try {
      const res = await axios.post(`${API_URL}/api/inquiry`, {
        propertyId: property._id,
        message: inquiry.message,
      });

      if (res.data?.success) {
        setInquiryStatus({ loading: false, success: true, error: null });
        setInquiry({ message: "" });
      }
    } catch (err) {
      setInquiryStatus({
        loading: false,
        success: false,
        error: err.response?.data?.message || "Failed to submit inquiry",
      });
    }
  };

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () =>
    setLightboxIndex((prev) => (prev + 1) % property.images.length);
  const prevImage = () =>
    setLightboxIndex(
      (prev) => (prev - 1 + property.images.length) % property.images.length
    );

  if (loading) {
    return (
      <div className="loader-full-page">
        <div className="loader" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container pt-40 pb-20 text-center">
        <h2 className="text-2xl font-bold mb-4">{error || "Property not found"}</h2>
        <Link to="/properties" className="btn btn-primary">
          Back to Listings
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(property.price);

  const images = property.images && property.images.length > 0 ? property.images : [];

  return (
    <div className={s.pageContainer}>
      <div className={s.mainContainer}>
        {/* Breadcrumbs */}
        <div className={s.breadcrumbs}>
          <Link to="/" className={s.breadcrumbLink}>Home</Link>
          <span>/</span>
          <Link to="/properties" className={s.breadcrumbLink}>Properties</Link>
          <span>/</span>
          <span className={s.breadcrumbCurrent}>{property.title}</span>
        </div>

        {/* Gallery Section */}
        {images.length > 0 && (
          <div className={s.galleryContainer}>
            {/* Desktop Gallery Grid */}
            <div
              className={s.galleryGrid}
              style={{
                gridTemplateColumns: images.length > 1 ? "repeat(4, 1fr)" : "1fr",
                gridTemplateRows: images.length > 1 ? "repeat(2, 200px)" : "420px",
              }}
            >
              <div
                className={s.galleryMainItem(images.length > 1)}
                onClick={() => openLightbox(0)}
              >
                <img src={images[0]} alt={property.title} className={s.galleryImage} />
              </div>

              {images.slice(1, 5).map((img, idx) => (
                <div
                  key={idx}
                  className={s.gallerySideItem}
                  onClick={() => openLightbox(idx + 1)}
                >
                  <img src={img} alt="" className={s.galleryImage} />
                  {idx === 3 && images.length > 5 && (
                    <div className={s.galleryMoreOverlay}>
                      +{images.length - 5} More
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Horizontal Carousel */}
            <div className={s.mobileSliderContainer}>
              <div className={s.mobileSliderTrack}>
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={s.mobileSlide}
                    onClick={() => openLightbox(idx)}
                  >
                    <img src={img} alt="" className={s.mobileSlideImage} />
                    <span className={s.mobileSlideCounter}>
                      {idx + 1} / {images.length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lightbox Modal */}
        {lightboxIndex !== null && images.length > 0 && (
          <div className={s.lightboxOverlay} onClick={closeLightbox}>
            <button className={s.lightboxCloseBtn} onClick={closeLightbox}>
              <HiX size={24} className={s.lightboxCloseIcon} />
            </button>
            <div className={s.lightboxContent} onClick={(e) => e.stopPropagation()}>
              <img
                src={images[lightboxIndex]}
                alt="Full size"
                className={s.lightboxImage}
              />
              {images.length > 1 && (
                <>
                  <button className={s.lightboxPrevBtn} onClick={prevImage}>
                    <HiChevronLeft size={24} />
                  </button>
                  <button className={s.lightboxNextBtn} onClick={nextImage}>
                    <HiChevronRight size={24} />
                  </button>
                </>
              )}
              <span className={s.lightboxCounter}>
                {lightboxIndex + 1} of {images.length}
              </span>
            </div>
          </div>
        )}

        {/* Details Layout */}
        <div className={s.detailsLayout}>
          {/* Left Column: Info, Specs, Amenities, Description */}
          <div className={s.infoColumn}>
            <div className={s.infoHeader}>
              <div className="flex justify-between items-start gap-4">
                <div className={s.titleWrapper}>
                  <div className={s.badgeWrapper}>
                    <span className={s.premiumBadge}>
                      {property.propertyType}
                    </span>
                    <span className="py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold uppercase inline-block mb-3">
                      For {property.status}
                    </span>
                  </div>
                  <h1 className={s.propertyTitle}>{property.title}</h1>
                  <p className={s.propertyLocation}>
                    <HiOutlineLocationMarker className={s.locationIcon} />
                    <span className={s.locationText}>
                      {property.area}, {property.city} - {property.pincode}
                    </span>
                  </p>
                </div>

                <div className={s.actionButtons}>
                  <button
                    type="button"
                    className={s.wishlistButton(isInWishlist)}
                    onClick={handleToggleWishlist}
                    title={isInWishlist ? "Remove from Wishlist" : "Save to Wishlist"}
                  >
                    {isInWishlist ? (
                      <HiHeart size={24} className="text-red-500" />
                    ) : (
                      <HiOutlineHeart size={24} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className={s.statsGrid}>
              {[
                { label: "Bedrooms", value: `${property.bhk || "—"} BHK`, icon: HiOutlineHome },
                { label: "Bathrooms", value: property.bathrooms || "—", icon: HiOutlineUserGroup },
                { label: "Living Area", value: property.areaSize ? `${property.areaSize} sqft` : "—", icon: HiOutlineViewGrid },
                { label: "Furnishing", value: property.furnishing || "Unfurnished", icon: HiCollection },
                { label: "Type", value: property.propertyType, icon: HiCalendar },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className={s.statCard}>
                    <Icon size={22} className={s.statIcon} />
                    <div className={s.statValue}>{stat.value}</div>
                    <div className={s.statLabel}>{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Description */}
            <div className={s.descriptionSection}>
              <h3 className={s.sectionTitle}>About this Property</h3>
              <p className={s.descriptionText}>{property.description}</p>
            </div>

            {/* Amenities Checklist */}
            <div className={s.amenitiesSection}>
              <h3 className={s.sectionTitle}>Amenities & Features</h3>
              <div className={s.amenitiesGrid}>
                {(property.amenities && property.amenities.length > 0
                  ? property.amenities
                  : ["Parking", "24/7 Security", "Water Supply", "Power Backup"]
                ).map((amn, i) => (
                  <div key={i} className={s.amenityItem}>
                    <HiOutlineCheckCircle size={20} className={s.amenityIcon} />
                    <span className={s.amenityText}>{amn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Details Table */}
            <div className={s.additionalDetails}>
              <h3 className={s.detailsTitle}>Property Overview</h3>
              <div className={s.detailsGrid}>
                <div className={s.detailRow}>
                  <span className={s.detailLabel}>Property ID</span>
                  <span className={s.detailValue}>{property._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className={s.detailRow}>
                  <span className={s.detailLabel}>Listed On</span>
                  <span className={s.detailValue}>
                    {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={s.detailRow}>
                  <span className={s.detailLabel}>Legal Verification</span>
                  <span className={s.detailValue}>
                    {property.isVerified ? "Audited & Verified" : "Pending Verification"}
                  </span>
                </div>
                <div className={s.detailRow}>
                  <span className={s.detailLabel}>Views Recorded</span>
                  <span className={s.detailValue}>{property.views || 0} interested</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Price Card & Seller / Inquiry Widget */}
          <div className={s.sidebarColumn}>
            {/* Price Card */}
            <div className={`${s.priceCard} bg-primary`}>
              <div className={s.priceCardLabel}>Selling Price</div>
              <div className={s.priceCardValue}>{formattedPrice}</div>
              <div className={s.priceCardAvailability}>
                Status: Available for immediate registration
              </div>
            </div>

            {/* Seller Info & Contact Widget */}
            <div className={s.sellerCard}>
              <div className={s.sellerInfo}>
                <div className={s.sellerAvatar}>
                  <img
                    src={
                      property.seller?.profilePic ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        property.seller?.name || "Seller"
                      )}&background=0d9488&color=fff`
                    }
                    alt={property.seller?.name}
                    className={s.sellerAvatarImage}
                  />
                </div>
                <div className={s.sellerDetails}>
                  <h4 className={s.sellerName}>{property.seller?.name || "Property Owner"}</h4>
                  <div className={s.sellerVerifiedBadge}>
                    <HiBadgeCheck size={16} className={s.verifiedIcon} /> Verified Listing Partner
                  </div>
                </div>
              </div>

              {/* Direct Chat Button */}
              <div className={s.chatButtonWrapper}>
                <button
                  type="button"
                  className={s.chatButton}
                  onClick={handleChatStart}
                >
                  <HiChatAlt size={18} /> Direct Chat with Seller
                </button>
              </div>

              {/* Inquiry Form */}
              <h4 className={s.inquiryFormTitle}>Send Inquiry Message</h4>
              {user ? (
                <form onSubmit={handleInquirySubmit}>
                  <textarea
                    placeholder="Hello, I am interested in this property. Is it still available for a visit?"
                    value={inquiry.message}
                    onChange={(e) => setInquiry({ message: e.target.value })}
                    className={s.inquiryTextarea}
                    required
                  />
                  <button
                    type="submit"
                    className={s.inquirySubmitButton}
                    disabled={inquiryStatus.loading}
                  >
                    {inquiryStatus.loading ? "Sending..." : "Submit Inquiry"}
                  </button>
                  {inquiryStatus.success && (
                    <p className={s.inquirySuccessMessage}>
                      ✓ Inquiry sent to the seller successfully!
                    </p>
                  )}
                  {inquiryStatus.error && (
                    <p className="text-red-600 text-xs mt-2 text-center">
                      {inquiryStatus.error}
                    </p>
                  )}
                </form>
              ) : (
                <div className={s.inquiryDisabledMessage}>
                  <p className={s.inquiryDisabledText}>
                    Please sign in to message the seller or submit an inquiry.
                  </p>
                  <Link to="/login" className={s.inquiryLoginButton}>
                    Log In to Continue
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <div className={s.similarSection}>
            <h2 className="text-2xl font-bold mb-8">Similar Properties in {property.city}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProperties.map((simProp) => (
                <PropertyCard key={simProp._id} property={simProp} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetails;
