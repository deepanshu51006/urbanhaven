import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  HiOutlineLibrary,
  HiOutlineChatAlt2,
  HiOutlineCalendar,
  HiOutlineTrash,
  HiOutlineMenu,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import {
  adminInquiriesStyles as s,
  adminLayoutStyles as ls,
  dashboardNavbarStyles as ns,
} from "../../assets/dummyStyles.js";

const AdminInquiries = () => {
  const { API_URL } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/inquiry/admin/all`);
      if (res.data?.success) {
        setInquiries(res.data.inquiries || []);
      }
    } catch (err) {
      console.error("Fetch inquiries error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm("Are you sure you want to remove this inquiry?")) return;
    try {
      const res = await axios.delete(`${API_URL}/api/inquiry/${id}`);
      if (res.data?.success) {
        setInquiries((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      alert("Failed to delete inquiry.");
    }
  };

  return (
    <div className={ls.container}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={ls.contentWrapper}>
        {/* Mobile Header Bar */}
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
            <h1 className={s.headerTitle}>Buyer Inquiries</h1>
            <p className={s.headerSubtitle}>
              Monitor all communication leads sent from prospective buyers to sellers.
            </p>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="loader" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className={s.emptyState}>
              <HiOutlineChatAlt2 size={48} className="mx-auto mb-4 text-[#94a3b8]" />
              <p className={s.emptyText}>No property inquiries have been submitted yet.</p>
            </div>
          ) : (
            <div className={s.listContainer}>
              {inquiries.map((inq) => (
                <div key={inq._id} className={s.inquiryCard}>
                  {/* Top: Property & Date & Delete */}
                  <div className={s.cardTopSection}>
                    <div className={s.propertyInfoWrapper}>
                      <div className={s.propertyIconWrapper}>
                        <HiOutlineLibrary size={24} />
                      </div>
                      <div className={s.propertyTextWrapper}>
                        <h3 className={s.propertyTitle}>
                          {inq.property?.title || "Property Listing"}
                        </h3>
                        <p className={s.propertyId}>
                          {inq.property?.city ? `${inq.property.city}, ` : ""}
                          {inq.property?.area || ""}
                          {inq.property?.price ? ` • ₹${Number(inq.property.price).toLocaleString()}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={s.dateWrapper}>
                        <HiOutlineCalendar className={s.dateIcon} />
                        {new Date(inq.createdAt).toLocaleString()}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteInquiry(inq._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Delete inquiry"
                      >
                        <HiOutlineTrash size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Buyer & Seller Details Grid */}
                  <div className={s.detailsGrid}>
                    <div className={s.detailCard}>
                      <span className={s.detailLabel}>Buyer (Inquirer)</span>
                      <p className={s.detailName}>{inq.name || inq.buyer?.name || "Anonymous Buyer"}</p>
                      <p className={s.detailEmail}>
                        {inq.email || inq.buyer?.email || "No email"}
                        {inq.phone ? ` • ${inq.phone}` : inq.buyer?.phone ? ` • ${inq.buyer.phone}` : ""}
                      </p>
                    </div>

                    <div className={s.detailCard}>
                      <span className={s.detailLabel}>Listing Seller</span>
                      <p className={s.detailName}>{inq.seller?.name || "Seller"}</p>
                      <p className={s.detailEmail}>{inq.seller?.email || "N/A"}</p>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className={s.messageContainer}>
                    <div className={s.messageHeader}>
                      <HiOutlineChatAlt2 size={18} /> Inquirer Message
                    </div>
                    <p className={s.messageText}>"{inq.message}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminInquiries;
