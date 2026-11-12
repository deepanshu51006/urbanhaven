import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineUserGroup,
  HiOutlineLibrary,
  HiOutlineCheckCircle,
  HiOutlineChatAlt2,
  HiOutlineRefresh,
  HiOutlineUsers,
  HiOutlineMail,
  HiOutlineShieldCheck,
  HiOutlineMenu,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import {
  adminDashboardStyles as s,
  adminLayoutStyles as ls,
  dashboardNavbarStyles as ns,
} from "../../assets/dummyStyles.js";

const AdminDashboard = () => {
  const { API_URL } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    activeListings: 0,
    soldProperties: 0,
    totalInquiries: 0,
    totalContacts: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/stats`);
      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Admin stats fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Registered Users",
      value: stats.totalUsers || 0,
      icon: HiOutlineUserGroup,
      color: "#0d9488",
      bg: "#ccfbf1",
    },
    {
      title: "Total Properties Listed",
      value: stats.totalProperties || 0,
      icon: HiOutlineLibrary,
      color: "#f59e0b",
      bg: "#fef3c7",
    },
    {
      title: "Active Properties (Sale)",
      value: stats.activeListings || 0,
      icon: HiOutlineShieldCheck,
      color: "#3b82f6",
      bg: "#dbeafe",
    },
    {
      title: "Sold Properties",
      value: stats.soldProperties || 0,
      icon: HiOutlineCheckCircle,
      color: "#10b981",
      bg: "#dcfce7",
    },
  ];

  if (loading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader} />
      </div>
    );
  }

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
          {/* Header */}
          <div className={s.headerContainer}>
            <div>
              <h1 className={s.pageTitle}>System Administration</h1>
              <p className={s.pageSubtitle}>
                Platform overview, infrastructure health, and management tools
              </p>
            </div>
            <button onClick={fetchStats} className={s.refreshButton}>
              <HiOutlineRefresh className="inline mr-1" /> Refresh
            </button>
          </div>

          {/* Stats Grid */}
          <div className={s.statsGrid}>
            {statCards.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className={s.statCard}>
                  <div
                    className={s.statIconContainer}
                    style={{ backgroundColor: c.bg, color: c.color }}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <div className={s.statTitle}>{c.title}</div>
                    <div className={s.statValue}>{c.value.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Second Grid: System Health & Admin Tools */}
          <div className={s.secondGrid}>
            {/* System Health */}
            <div className={s.systemHealthCard}>
              <h3 className={s.systemHealthTitle}>Infrastructure Status</h3>
              <div className={s.servicesContainer}>
                {[
                  { name: "Database (MongoDB)", status: "Connected & Operational" },
                  { name: "Media Uploads (Local Storage / Static)", status: "Active" },
                  { name: "Notification Relay", status: "Operational" },
                  { name: "JWT Auth Service", status: "Secure & Running" },
                ].map((service, i) => (
                  <div key={i} className={s.serviceItem}>
                    <span className={s.serviceName}>{service.name}</span>
                    <div className={s.statusContainer}>
                      <span className={s.statusDot} />
                      <span className={s.statusText}>{service.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Quick Navigation Tools */}
            <div className={s.adminToolsCard}>
              <h3 className={s.adminToolsTitle}>Administrative Actions</h3>
              <p className={s.adminToolsDesc}>
                Quick access to review platform members, audits, and messages.
              </p>
              <div className={s.adminToolsButtonsContainer}>
                <Link to="/admin/users" className={s.adminToolButton}>
                  <HiOutlineUsers size={18} /> Manage All Users ({stats.totalUsers})
                </Link>
                <Link to="/admin/properties" className={s.adminToolButton}>
                  <HiOutlineLibrary size={18} /> Audit Properties ({stats.totalProperties})
                </Link>
                <Link to="/admin/inquiries" className={s.adminToolButton}>
                  <HiOutlineChatAlt2 size={18} /> Review Inquiries ({stats.totalInquiries})
                </Link>
                <Link to="/admin/contacts" className={s.adminToolButton}>
                  <HiOutlineMail size={18} /> Contact Inquiries ({stats.totalContacts})
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
