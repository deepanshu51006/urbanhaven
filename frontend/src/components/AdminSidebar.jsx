import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiOutlineLibrary,
  HiOutlineChatAlt2,
  HiOutlineMail,
  HiOutlineLogout,
  HiX,
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext.jsx";
import { adminSidebarStyles as s } from "../assets/dummyStyles.js";

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { name: "Overview", icon: HiOutlineViewGrid, path: "/admin-dashboard" },
    { name: "Users", icon: HiOutlineUsers, path: "/admin/users" },
    {
      name: "Seller Requests",
      icon: HiOutlineUserCircle,
      path: "/admin/seller-requests",
    },
    { name: "Properties", icon: HiOutlineLibrary, path: "/admin/properties" },
    { name: "Inquiries", icon: HiOutlineChatAlt2, path: "/admin/inquiries" },
    { name: "Contact Inbox", icon: HiOutlineMail, path: "/admin/contacts" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div className={s.backdrop(isOpen)} onClick={onClose} />
      <aside className={s.sidebar(isOpen)}>
        <div className={s.logoContainer}>
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-teal-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="font-extrabold text-lg text-primary tracking-tight">
              Urban<span className="text-text-main">Admin</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden text-text-muted hover:text-text-main"
          >
            <HiX size={22} />
          </button>
        </div>

        <nav className={s.navContainer}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={s.navLink(isActive)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className={s.logoutContainer}>
          <button onClick={handleLogout} className={s.logoutButton}>
            <HiOutlineLogout size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
