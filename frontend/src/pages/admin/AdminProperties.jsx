import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineExternalLink,
  HiOutlineTrash,
  HiShieldCheck,
  HiOutlineMenu,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import PropertyCard from "../../components/common/PropertyCard.jsx";
import {
  adminPropertiesStyles as s,
  adminLayoutStyles as ls,
  dashboardNavbarStyles as ns,
} from "../../assets/dummyStyles.js";

const AdminProperties = () => {
  const { API_URL } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/property`);
      if (res.data?.success) {
        setProperties(res.data.properties || []);
      }
    } catch (err) {
      console.error("Admin fetch properties error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleToggleVerify = async (id) => {
    try {
      const res = await axios.patch(`${API_URL}/api/admin/properties/${id}/verify`);
      if (res.data?.success) {
        setProperties((prev) =>
          prev.map((p) => (p._id === id ? { ...p, isVerified: res.data.property.isVerified } : p))
        );
      }
    } catch (err) {
      alert("Failed to update property verification.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this listing?")) return;
    try {
      await axios.delete(`${API_URL}/api/property/${id}`);
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert("Failed to delete property.");
    }
  };

  return (
    <div className={ls.container}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
              Urban<span className="text-text-main">Admin</span>
            </span>
          </div>
        </header>

        <main className={ls.main}>
          <div className={s.headerContainer}>
            <h1 className={s.pageTitle}>Property Listings Audit</h1>
            <p className={s.pageSubtitle}>
              Review, verify, and moderate all property listings across the platform.
            </p>
          </div>

          {loading ? (
            <div className="py-20 text-center"><div className="loader" /></div>
          ) : properties.length === 0 ? (
            <div className={s.emptyStateCard}>
              <p>No properties listed on the platform yet.</p>
            </div>
          ) : (
            <div className={s.propertiesGrid}>
              {properties.map((p) => (
                <PropertyCard
                  key={p._id}
                  property={p}
                  customActions={
                    <div className={s.actionWrapper}>
                      <button
                        type="button"
                        onClick={() => handleToggleVerify(p._id)}
                        className={`btn btn-outline flex-1 p-2 text-xs flex items-center justify-center gap-1 ${
                          p.isVerified ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "text-[#64748b]"
                        }`}
                      >
                        <HiShieldCheck size={16} />
                        {p.isVerified ? "Verified" : "Verify"}
                      </button>

                      <div className={s.buttonGroup}>
                        <Link to={`/property/${p._id}`} className={s.viewLink} title="Public View">
                          <HiOutlineExternalLink size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p._id)}
                          className={s.deleteButton}
                          title="Delete Listing"
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminProperties;
