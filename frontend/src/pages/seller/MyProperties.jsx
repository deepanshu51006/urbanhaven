import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  HiPlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineHome,
  HiChevronDown,
  HiOutlineMenu,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import SellerSidebar from "../../components/SellerSidebar.jsx";
import PropertyCard from "../../components/common/PropertyCard.jsx";
import {
  myPropertiesStyles as s,
  sellerLayoutStyles as ls,
  dashboardNavbarStyles as ns,
} from "../../assets/dummyStyles.js";

const MyProperties = () => {
  const { token, API_URL } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/property/seller/my-properties`);
      if (res.data?.success) {
        setProperties(res.data.properties || []);
      }
    } catch (err) {
      console.error("Fetch my properties error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [token]);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/api/property/${id}/status`, {
        status: newStatus,
      });
      setProperties(
        properties.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      alert("Failed to update listing status.");
    }
  };

  const deleteProperty = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await axios.delete(`${API_URL}/api/property/${id}`);
      setProperties(properties.filter((p) => p._id !== id));
    } catch (err) {
      alert("Failed to delete property.");
    }
  };

  return (
    <div className={ls.container}>
      <SellerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={ls.contentWrapper}>
        <header className={ns.header}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={ns.menuButton}
            aria-label="Open Navigation"
          >
            <HiOutlineMenu size={24} />
          </button>
          <div className={ns.logoContainer}>
            <span className="font-extrabold text-primary text-base">
              Seller<span className="text-text-main">Hub</span>
            </span>
          </div>
        </header>

        <main className={ls.main}>
          <div className={s.fadeIn}>
            <div className={s.header}>
              <div>
                <h1 className={s.heading}>My Property Listings</h1>
                <p className={s.subheading}>
                  Manage all your active and archived real estate listings
                </p>
              </div>

              <Link to="/seller/add-property" className={s.addButton}>
                <HiPlus className="inline mr-1" /> Add New Property
              </Link>
            </div>

            {loading ? (
              <div className="py-24 text-center">
                <div className="loader" />
              </div>
            ) : properties.length === 0 ? (
              <div className={s.emptyCard}>
                <div className={s.emptyIconWrapper}>
                  <HiOutlineHome size={40} className="text-[#64748b]" />
                </div>
                <h3 className={s.emptyTitle}>You haven't listed any properties yet</h3>
                <p className={s.emptyText}>
                  Start advertising your properties to thousands of verified buyers today.
                </p>
                <Link to="/seller/add-property" className={s.emptyButton}>
                  List Your First Property
                </Link>
              </div>
            ) : (
              <div className={s.grid}>
                {properties.map((p) => (
                  <PropertyCard
                    key={p._id}
                    property={p}
                    customActions={
                      <div className={s.actionContainer}>
                        <div className={s.selectWrapper}>
                          <select
                            value={p.status}
                            onChange={(e) => updateStatus(p._id, e.target.value)}
                            className={`${s.select} ${
                              p.status === "sold" ? s.selectSold : s.selectAvailable
                            }`}
                          >
                            <option value="sale">For Sale (Available)</option>
                            <option value="sold">Mark as Sold</option>
                          </select>
                          <HiChevronDown size={14} className={s.selectIcon} />
                        </div>

                        <Link
                          to={`/seller/edit-property/${p._id}`}
                          className={s.editButton}
                          title="Edit Listing"
                        >
                          <HiOutlinePencil size={15} /> Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => deleteProperty(p._id)}
                          className={s.deleteButton}
                          title="Delete Listing"
                        >
                          <HiOutlineTrash size={15} /> Delete
                        </button>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyProperties;
