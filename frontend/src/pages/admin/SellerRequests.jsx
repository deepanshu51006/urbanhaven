import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  HiOutlineUserCircle,
  HiCheck,
  HiX,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineMenu,
  HiOutlineClock,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import {
  sellerRequestsStyles as s,
  adminLayoutStyles as ls,
  dashboardNavbarStyles as ns,
} from "../../assets/dummyStyles.js";

const SellerRequests = () => {
  const { API_URL } = useAuth();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'pending' | 'approved'

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/users?role=seller`);
      if (res.data?.success) {
        setSellers(res.data.users || []);
      }
    } catch (err) {
      console.error("Fetch sellers error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleToggleApproval = async (userId, currentStatus) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/admin/users/${userId}/approve-seller`,
        { isSellerApproved: !currentStatus }
      );
      if (res.data?.success) {
        setSellers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, isSellerApproved: !currentStatus } : u
          )
        );
      }
    } catch (err) {
      alert("Failed to update approval status.");
    }
  };

  const filteredSellers = useMemo(() => {
    if (filterTab === "pending") return sellers.filter((s) => !s.isSellerApproved);
    if (filterTab === "approved") return sellers.filter((s) => s.isSellerApproved);
    return sellers;
  }, [sellers, filterTab]);

  const pendingCount = sellers.filter((s) => !s.isSellerApproved).length;
  const approvedCount = sellers.filter((s) => s.isSellerApproved).length;

  return (
    <div className={ls.container}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={ls.contentWrapper}>
        {/* Mobile Header */}
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className={s.pageTitle}>Seller Approval Requests</h1>
                <p className={s.pageSubtitle}>
                  Review, verify, and authorize seller accounts to permit property publishing.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex bg-white p-1 rounded-xl border border-[#e2e8f0] shadow-sm self-start">
                <button
                  type="button"
                  onClick={() => setFilterTab("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterTab === "all"
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  All ({sellers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("pending")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    filterTab === "pending"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  <HiOutlineClock size={14} /> Pending ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("approved")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    filterTab === "approved"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  <HiOutlineCheckCircle size={14} /> Approved ({approvedCount})
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="loader" />
            </div>
          ) : filteredSellers.length === 0 ? (
            <div className={s.emptyState}>
              <HiOutlineUserCircle size={56} className="mx-auto mb-4 text-[#94a3b8] opacity-60" />
              <p className={s.emptyText}>
                {filterTab === "pending"
                  ? "No sellers are currently pending approval. All active sellers are verified!"
                  : filterTab === "approved"
                  ? "No approved sellers found."
                  : "No seller accounts registered yet."}
              </p>
            </div>
          ) : (
            <div className={s.listContainer}>
              {filteredSellers.map((seller) => (
                <div key={seller._id} className={s.card}>
                  <div className={s.cardHeader}>
                    <div className={s.userInfoWrapper}>
                      <div className={s.avatar}>
                        {seller.profilePic ? (
                          <img
                            src={seller.profilePic}
                            alt=""
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          seller.name?.charAt(0).toUpperCase() || "S"
                        )}
                      </div>
                      <div className={s.userDetails}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={s.userName}>{seller.name}</h3>
                          <span className={s.statusBadge(seller.isSellerApproved)}>
                            {seller.isSellerApproved ? "Verified Seller" : "Pending Review"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-text-muted mt-1.5">
                          <span className="flex items-center gap-1">
                            <HiOutlineMail className="text-primary" /> {seller.email}
                          </span>
                          {seller.phone && (
                            <span className="flex items-center gap-1">
                              <HiOutlinePhone className="text-primary" /> {seller.phone}
                            </span>
                          )}
                          {seller.address && (
                            <span className="flex items-center gap-1">
                              <HiOutlineLocationMarker className="text-primary" /> {seller.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={s.actionsWrapper}>
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleApproval(seller._id, seller.isSellerApproved)
                        }
                        className={
                          seller.isSellerApproved
                            ? s.rejectButton
                            : s.approveButton
                        }
                      >
                        {seller.isSellerApproved ? (
                          <>
                            <HiX size={16} /> Revoke Approval
                          </>
                        ) : (
                          <>
                            <HiCheck size={16} /> Approve Seller
                          </>
                        )}
                      </button>
                    </div>
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

export default SellerRequests;
