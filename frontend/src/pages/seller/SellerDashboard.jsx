import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineEye,
  HiOutlineLibrary,
  HiOutlineCheckCircle,
  HiOutlineUserGroup,
  HiPlus,
  HiOutlineDownload,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineExternalLink,
  HiOutlineLightBulb,
  HiOutlineMenu,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import SellerSidebar from "../../components/SellerSidebar.jsx";
import PropertyCard from "../../components/common/PropertyCard.jsx";
import {
  sellerDashboardStyles as s,
  sellerLayoutStyles as ls,
  dashboardNavbarStyles as ns,
} from "../../assets/dummyStyles.js";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, token, API_URL } = useAuth();

  const [stats, setStats] = useState({
    totalViews: 0,
    activeListings: 0,
    soldProperties: 0,
    totalInquiries: 0,
  });
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, propsRes, inqRes] = await Promise.all([
        axios.get(`${API_URL}/api/property/seller/stats`),
        axios.get(`${API_URL}/api/property/seller/my-properties`),
        axios.get(`${API_URL}/api/inquiry/seller`),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (propsRes.data?.success) setProperties(propsRes.data.properties || []);
      if (inqRes.data?.success) setInquiries(inqRes.data.inquiries || []);
    } catch (err) {
      console.error("Seller dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const handleToggleStatus = async (propertyId, currentStatus) => {
    const nextStatus = currentStatus === "sale" ? "sold" : "sale";
    try {
      await axios.patch(`${API_URL}/api/property/${propertyId}/status`, {
        status: nextStatus,
      });
      setProperties((prev) =>
        prev.map((p) => (p._id === propertyId ? { ...p, status: nextStatus } : p))
      );
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this listing permanently?"))
      return;
    try {
      await axios.delete(`${API_URL}/api/property/${propertyId}`);
      setProperties((prev) => prev.filter((p) => p._id !== propertyId));
    } catch (err) {
      console.error("Delete property error:", err);
    }
  };

  const handleExport = () => {
    const headers = ["Title", "Location", "Type", "Price", "Status", "Views"];
    const csvRows = properties.map((p) => [
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.area}, ${p.city}"`,
      p.propertyType,
      p.price,
      p.status,
      p.views || 0,
    ]);

    const csvContent = [headers.join(","), ...csvRows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `listings_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statCards = [
    {
      title: "Total Views",
      value: stats.totalViews?.toLocaleString() || "0",
      icon: HiOutlineEye,
    },
    {
      title: "Active Leads",
      value: stats.totalInquiries?.toLocaleString() || "0",
      icon: HiOutlineUserGroup,
    },
    {
      title: "Live Listings",
      value: stats.activeListings?.toLocaleString() || "0",
      icon: HiOutlineLibrary,
    },
    {
      title: "Properties Sold",
      value: stats.soldProperties?.toLocaleString() || "0",
      icon: HiOutlineCheckCircle,
    },
  ];

  const filteredProperties = Array.isArray(properties)
    ? properties.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.area?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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
          {/* Header */}
          <div className={s.header}>
            <div className={s.headerLeft}>
              <h1 className={s.headerTitle}>Seller Studio</h1>
              <p className={s.headerSubtitle}>
                Welcome back, {user?.name}. Here's how your listings are performing.
              </p>
            </div>

            <div className={s.headerActions}>
              <button onClick={handleExport} className={s.exportButton}>
                <HiOutlineDownload size={18} /> Export CSV
              </button>
              <Link to="/seller/add-property" className={s.addButton}>
                <HiPlus size={18} /> Add Property
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className={s.statsGrid}>
            {statCards.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className={s.statCard}>
                  <div className={s.statIconWrapper}>
                    <Icon size={22} className="text-primary" />
                  </div>
                  <div className={s.statTitle}>{c.title}</div>
                  <div className={s.statValue}>{c.value}</div>
                </div>
              );
            })}
          </div>

          {/* Listings Management */}
          <div className={s.listingsSection}>
            <div className={s.listingsHeader}>
              <h2 className={s.listingsTitle}>My Property Listings</h2>
              <div className={s.searchWrapper}>
                <HiOutlineSearch size={18} className={s.searchIcon} />
                <input
                  type="text"
                  placeholder="Filter listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={s.searchInput}
                />
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center"><div className="loader" /></div>
            ) : filteredProperties.length === 0 ? (
              <div className={s.emptyListings}>
                <p className="mb-4">No listings found matching your search.</p>
                <Link to="/seller/add-property" className="btn btn-primary">
                  Create First Listing
                </Link>
              </div>
            ) : (
              <div className={s.propertiesGrid}>
                {filteredProperties.map((prop) => (
                  <PropertyCard
                    key={prop._id}
                    property={prop}
                    customActions={
                      <div className={s.propertyActions}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(prop._id, prop.status)}
                          className={s.statusButton(prop.status)}
                          title="Toggle Sale / Sold"
                        >
                          <HiOutlineCheckCircle size={14} />
                          {prop.status === "sold" ? "Sold" : "Mark Sold"}
                        </button>
                        <Link
                          to={`/seller/edit-property/${prop._id}`}
                          className={s.editButton}
                          title="Edit"
                        >
                          <HiOutlinePencil size={14} /> Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(prop._id)}
                          className={s.deleteButton}
                          title="Delete"
                        >
                          <HiOutlineTrash size={14} /> Delete
                        </button>
                        <Link
                          to={`/property/${prop._id}`}
                          className={s.viewButton}
                          title="Public View"
                        >
                          <HiOutlineExternalLink size={16} />
                        </Link>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Widgets Grid: Recent Leads & Listing Tips */}
          <div className={s.widgetsGrid}>
            {/* Leads Widget */}
            <div className={s.inquiriesWidget}>
              <h3 className={s.widgetTitle}>Recent Leads</h3>
              <p className={s.widgetSubtitle}>Prospective buyers interested in your properties</p>
              {inquiries.length === 0 ? (
                <p className={s.noInquiries}>No inquiries received yet.</p>
              ) : (
                <div className={s.inquiriesList}>
                  {inquiries.slice(0, 5).map((inq) => (
                    <div key={inq._id} className={s.inquiryItem}>
                      <div className={s.inquiryLeft}>
                        <div className={s.inquiryIcon}>
                          <HiOutlineUserGroup size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className={s.inquiryName}>{inq.name || inq.buyer?.name}</p>
                          <p className={s.inquiryProperty}>{inq.property?.title}</p>
                        </div>
                      </div>
                      <div className={s.inquiryRight}>
                        <p className={s.inquiryDate}>
                          {new Date(inq.createdAt).toLocaleDateString()}
                        </p>
                        <span className={s.inquiryStatus(inq.isRead ? "read" : "new")}>
                          {inq.isRead ? "Read" : "New Lead"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seller Tips Widget */}
            <div className={s.tipsWidget}>
              <h3 className={s.widgetTitle}>Listing Insights</h3>
              <p className={s.widgetSubtitle}>Best practices to sell faster</p>
              <div className={s.tipsList}>
                <div className={s.tipCardHighViews}>
                  <h4 className={s.tipTitleHighViews}>
                    <HiOutlineLightBulb size={18} /> High-Resolution Photos
                  </h4>
                  <p className={s.tipTextHighViews}>
                    Listings with 4+ clear daylight photos receive 3.5x more inquiries from verified buyers.
                  </p>
                </div>
                <div className={s.tipCardMarket}>
                  <h4 className={s.tipTitleMarket}>Competitive Pricing</h4>
                  <p className={s.tipTextMarket}>
                    Properties priced within 5% of their area average close twice as quickly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;
