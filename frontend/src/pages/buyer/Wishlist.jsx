import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { HiOutlineHeart, HiOutlineTrash } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import PropertyCard from "../../components/common/PropertyCard.jsx";
import { wishlistStyles as s } from "../../assets/dummyStyles.js";

const Wishlist = () => {
  const { token, API_URL } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/wishlist`);
      if (res.data?.success) {
        setWishlistItems(res.data.wishlist || []);
      }
    } catch (err) {
      console.error("Fetch wishlist error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWishlist();
    }
  }, [token]);

  const removeFromWishlist = async (propertyId) => {
    try {
      await axios.delete(`${API_URL}/api/wishlist/${propertyId}`);
      setWishlistItems((prev) => prev.filter((p) => p._id !== propertyId));
    } catch (err) {
      alert("Failed to remove property from wishlist");
    }
  };

  if (loading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader} />
      </div>
    );
  }

  return (
    <div className={s.pageContainer}>
      <div className={s.mainContainer}>
        <div className={s.headingWrapper}>
          <h1 className={s.heading}>Saved Properties</h1>
          <p className={s.subheading}>
            Manage all the real estate listings you've bookmarked for comparison
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className={s.emptyCard}>
            <div className={s.emptyIconWrapper}>
              <HiOutlineHeart size={40} />
            </div>
            <h3 className={s.emptyTitle}>Your Wishlist is Empty</h3>
            <p className={s.emptyText}>
              Explore our verified properties and click the heart icon on any listing to bookmark it here.
            </p>
            <Link to="/properties" className={s.browseButton}>
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className={s.gridContainer}>
            {wishlistItems.map((property) => (
              <div key={property._id} className="w-full">
                <PropertyCard
                  property={property}
                  isWishlisted={true}
                  onToggleWishlist={removeFromWishlist}
                  customActions={
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(property._id)}
                      className={s.removeButton}
                    >
                      <HiOutlineTrash size={18} /> Remove from Wishlist
                    </button>
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
