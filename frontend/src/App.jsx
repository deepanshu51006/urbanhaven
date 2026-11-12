import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { FaChevronUp } from "react-icons/fa";
import { useAuth } from "./context/AuthContext.jsx";

// Common Components
import Navbar from "./components/common/Navbar.jsx";

// Shared Pages
import LandingPage from "./pages/shared/LandingPage.jsx";
import Properties from "./pages/shared/Properties.jsx";
import PropertyDetails from "./pages/shared/PropertyDetails.jsx";
import Contact from "./pages/shared/Contact.jsx";
import Profile from "./pages/shared/Profile.jsx";
import ChatMessages from "./pages/shared/ChatMessages.jsx";

// Auth Pages
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

// Buyer Pages
import Wishlist from "./pages/buyer/Wishlist.jsx";

// Seller Pages
import SellerDashboard from "./pages/seller/SellerDashboard.jsx";
import AddProperty from "./pages/seller/AddProperty.jsx";
import EditProperty from "./pages/seller/EditProperty.jsx";
import MyProperties from "./pages/seller/MyProperties.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminProperties from "./pages/admin/AdminProperties.jsx";
import AdminInquiries from "./pages/admin/AdminInquiries.jsx";
import AdminContacts from "./pages/admin/AdminContacts.jsx";
import SellerRequests from "./pages/admin/SellerRequests.jsx";

// Scroll to top floating action button
const ScrollTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Scroll to top"
      className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
        visible
          ? "scale-100 opacity-100 bg-primary text-white hover:bg-primary-dark"
          : "pointer-events-none scale-0 opacity-0"
      }`}
    >
      <FaChevronUp size={20} />
    </button>
  );
};

// Route Guard component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loader-full-page">
        <div className="loader" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const location = useLocation();

  useEffect(() => {
    // Prevent horizontal overflow on root body
    document.body.style.overflowX = "hidden";
    document.documentElement.style.overflowX = "hidden";

    return () => {
      document.body.style.overflowX = "";
      document.documentElement.style.overflowX = "";
    };
  }, []);

  // Determine whether to display the global navigation header
  const isDashboardRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/seller") ||
    location.pathname === "/dashboard" ||
    location.pathname === "/my-properties";

  return (
    <div className="app-root min-h-screen flex flex-col font-sans">
      {!isDashboardRoute && <Navbar />}

      <div className="flex-1">
        <Routes>
          {/* Public / Shared Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/contact" element={<Contact />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* User Profile & Real-Time Messaging */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat-messages"
            element={
              <ProtectedRoute>
                <ChatMessages />
              </ProtectedRoute>
            }
          />

          {/* Buyer Routes */}
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute allowedRoles={["buyer", "seller", "admin"]}>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          {/* Seller Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["seller", "admin"]}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-properties"
            element={
              <ProtectedRoute allowedRoles={["seller", "admin"]}>
                <MyProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/add-property"
            element={
              <ProtectedRoute allowedRoles={["seller", "admin"]}>
                <AddProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-property"
            element={
              <ProtectedRoute allowedRoles={["seller", "admin"]}>
                <AddProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/edit-property/:id"
            element={
              <ProtectedRoute allowedRoles={["seller", "admin"]}>
                <EditProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-property/:id"
            element={
              <ProtectedRoute allowedRoles={["seller", "admin"]}>
                <EditProperty />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/properties"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inquiries"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminInquiries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contacts"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminContacts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/seller-requests"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SellerRequests />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <ScrollTopButton />
    </div>
  );
}

export default App;
