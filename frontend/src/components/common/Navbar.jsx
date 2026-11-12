import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import { navbarStyles as s, logoStyles as ls } from "../../assets/dummyStyles.js";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsDrawerOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className={s.nav}>
        <div className={s.container}>
          <div className={s.grid}>
            {/* Logo */}
            <Link to="/" className={ls.container}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-teal-500 flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className={ls.text}>
                Urban<span className="text-text-main">Haven</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className={s.desktopMenu}>
              <Link
                to="/"
                className={`${s.navLink} ${isActive("/") ? "text-primary bg-primary/10" : ""}`}
              >
                Home
              </Link>
              <Link
                to="/properties"
                className={`${s.navLink} ${isActive("/properties") ? "text-primary bg-primary/10" : ""}`}
              >
                Properties
              </Link>
              {user?.role === "buyer" && (
                <Link
                  to="/wishlist"
                  className={`${s.navLink} ${isActive("/wishlist") ? "text-primary bg-primary/10" : ""}`}
                >
                  Wishlist
                </Link>
              )}
              {user?.role === "seller" && (
                <Link
                  to="/dashboard"
                  className={`${s.navLink} ${isActive("/dashboard") ? "text-primary bg-primary/10" : ""}`}
                >
                  Seller Dashboard
                </Link>
              )}
              {user?.role === "admin" && (
                <Link
                  to="/admin-dashboard"
                  className={`${s.navLink} ${isActive("/admin-dashboard") ? "text-primary bg-primary/10" : ""}`}
                >
                  Admin Panel
                </Link>
              )}
              <Link
                to="/contact"
                className={`${s.navLink} ${isActive("/contact") ? "text-primary bg-primary/10" : ""}`}
              >
                Contact
              </Link>
            </nav>

            {/* Right Action / Auth */}
            <div className={s.rightSection}>
              {user ? (
                <div className={s.userSection}>
                  <Link to="/profile" title="View Profile">
                    <img
                      src={
                        user.profilePic ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name || "User"
                        )}&background=0d9488&color=fff`
                      }
                      alt="Profile"
                      className={s.avatar}
                    />
                  </Link>
                  <button onClick={handleLogout} className={s.logoutButton}>
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-3">
                  <Link to="/login" className="btn btn-outline py-2 px-5 text-sm">
                    Log In
                  </Link>
                  <Link to="/register" className="btn btn-primary py-2 px-5 text-sm">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Drawer Toggle */}
              <button
                className={s.mobileToggle}
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                aria-label="Toggle Navigation"
              >
                <HiMenu size={28} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      <div
        className={s.backdrop(isDrawerOpen)}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Mobile Drawer */}
      <div className={s.drawer(isDrawerOpen)}>
        <div className={s.drawerHeader}>
          <Link to="/" className={ls.container} onClick={() => setIsDrawerOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-teal-500 flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className={ls.text}>Urban<span className="text-text-main">Haven</span></span>
          </Link>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className={s.drawerCloseIcon}
            aria-label="Close menu"
          >
            <HiX size={26} />
          </button>
        </div>

        <div className={s.drawerNavLinks}>
          <Link
            to="/"
            className="hover:text-primary transition-colors"
            onClick={() => setIsDrawerOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/properties"
            className="hover:text-primary transition-colors"
            onClick={() => setIsDrawerOpen(false)}
          >
            Properties
          </Link>
          {user?.role === "buyer" && (
            <Link
              to="/wishlist"
              className="hover:text-primary transition-colors"
              onClick={() => setIsDrawerOpen(false)}
            >
              Wishlist
            </Link>
          )}
          {user?.role === "seller" && (
            <Link
              to="/dashboard"
              className="hover:text-primary transition-colors"
              onClick={() => setIsDrawerOpen(false)}
            >
              Seller Dashboard
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              to="/admin-dashboard"
              className="hover:text-primary transition-colors"
              onClick={() => setIsDrawerOpen(false)}
            >
              Admin Panel
            </Link>
          )}
          <Link
            to="/contact"
            className="hover:text-primary transition-colors"
            onClick={() => setIsDrawerOpen(false)}
          >
            Contact
          </Link>
          {user && (
            <Link
              to="/chat-messages"
              className="hover:text-primary transition-colors"
              onClick={() => setIsDrawerOpen(false)}
            >
              Messages
            </Link>
          )}
        </div>

        {user ? (
          <div className={s.drawerUserSection}>
            <Link
              to="/profile"
              className={s.drawerUserInfo}
              onClick={() => setIsDrawerOpen(false)}
            >
              <img
                src={
                  user.profilePic ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name || "User"
                  )}&background=0d9488&color=fff`
                }
                alt="Profile"
                className={s.drawerAvatar}
              />
              <div>
                <p className={s.drawerUserName}>{user.name}</p>
                <p className={s.drawerUserEmail}>{user.email}</p>
              </div>
            </Link>
            <button onClick={handleLogout} className={s.drawerLogoutButton}>
              Logout
            </button>
          </div>
        ) : (
          <div className="mt-auto pt-6 flex flex-col gap-3 border-t border-border">
            <Link
              to="/login"
              className="btn btn-outline w-full text-center"
              onClick={() => setIsDrawerOpen(false)}
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="btn btn-primary w-full text-center"
              onClick={() => setIsDrawerOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;