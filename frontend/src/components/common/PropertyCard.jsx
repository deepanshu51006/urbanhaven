import React from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineLocationMarker,
  HiOutlineEye,
  HiHeart,
  HiOutlineHeart,
  HiShieldCheck,
  HiArrowsExpand,
} from "react-icons/hi";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { propertyCardStyles as s } from "../../assets/dummyStyles.js";

const PropertyCard = ({ property, isWishlisted = false, onToggleWishlist, customActions }) => {
  if (!property) return null;

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(property.price);

  const primaryImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";

  return (
    <div className={s.card}>
      <Link to={`/property/${property._id}`} className={s.link}>
        {/* Image Section */}
        <div className={s.imageSection}>
          <img
            src={primaryImage}
            alt={property.title}
            className={s.image}
            loading="lazy"
          />

          {/* Top Badges */}
          <div className={s.topBadges}>
            <div className={s.badgesLeft}>
              <span className={s.badgeStatus(property.status)}>
                {property.status === "sold" ? "Sold" : "For Sale"}
              </span>
              {property.isVerified && (
                <span className={s.badgeVerified}>
                  <HiShieldCheck size={14} /> Verified
                </span>
              )}
            </div>

            {onToggleWishlist && (
              <button
                type="button"
                className={s.wishlistButton(isWishlisted)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleWishlist(property._id);
                }}
                aria-label="Wishlist toggle"
              >
                {isWishlisted ? (
                  <HiHeart size={18} className="text-red-500" />
                ) : (
                  <HiOutlineHeart size={18} />
                )}
              </button>
            )}
          </div>

          {/* Price Overlay */}
          <div className={s.priceOverlay}>
            <p className={s.price}>{formattedPrice}</p>
          </div>
        </div>

        {/* Content Section */}
        <div className={s.content}>
          <div className="flex justify-between items-center mb-1">
            <span className={s.propertyType}>{property.propertyType}</span>
            <span className={s.views}>
              <HiOutlineEye size={14} /> {property.views || 0}
            </span>
          </div>

          <h3 className={s.title} title={property.title}>
            {property.title}
          </h3>

          <p className={s.location}>
            <HiOutlineLocationMarker size={16} className={s.locationIcon} />
            <span className="truncate">
              {property.area}, {property.city}
            </span>
          </p>

          {/* Specs */}
          <div className={s.specsGrid}>
            <div className={s.specItem}>
              <div className={s.specIcon}>
                <HiOutlineHome size={18} />
              </div>
              <div className={s.specValue}>{property.bhk || "—"}</div>
              <div className={s.specLabel}>Beds</div>
            </div>

            <div className={`${s.specItem} ${s.specDivider}`}>
              <div className={s.specIcon}>
                <HiOutlineUserGroup size={18} />
              </div>
              <div className={s.specValue}>{property.bathrooms || "—"}</div>
              <div className={s.specLabel}>Baths</div>
            </div>

            <div className={s.specItem}>
              <div className={s.specIcon}>
                <HiArrowsExpand size={18} />
              </div>
              <div className={s.specValue}>
                {property.areaSize ? `${property.areaSize} sqft` : "—"}
              </div>
              <div className={s.specLabel}>Size</div>
            </div>
          </div>
        </div>
      </Link>

      {/* Optional custom actions buttons passed by parent */}
      {customActions && <div className={s.actionsContainer}>{customActions}</div>}
    </div>
  );
};

export default PropertyCard;