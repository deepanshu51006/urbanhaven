import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import {
  HiOutlineFilter,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineMenu,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import {
  adminUsersStyles as s,
  adminLayoutStyles as ls,
  dashboardNavbarStyles as ns,
} from "../../assets/dummyStyles.js";

const AdminUsers = () => {
  const { user: currentUser, API_URL } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [openFilter, setOpenFilter] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const filterRef = useRef(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/users`);
      if (res.data?.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setOpenFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await axios.patch(`${API_URL}/api/admin/users/${userId}/status`);
      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, isActive: res.data.user.isActive } : u
          )
        );
      }
    } catch (err) {
      alert("Failed to toggle user status.");
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await axios.patch(`${API_URL}/api/admin/users/${userId}/role`, {
        role: newRole,
      });
      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      alert("Failed to update user role.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?._id) {
      alert("You cannot delete your own admin account.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user permanently?"))
      return;

    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  const filteredUsers = useMemo(() => {
    if (roleFilter === "all") return users;
    return users.filter((u) => u.role === roleFilter);
  }, [users, roleFilter]);

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
          <div className={s.containerHeader}>
            <div>
              <h1 className={s.headerTitle}>User Management</h1>
              <p className={s.headerSubtitle}>
                View, monitor, adjust roles, and manage account statuses across all platform members.
              </p>
            </div>

            {/* Role Filter Dropdown */}
            <div className={s.filterWrapper} ref={filterRef}>
              <button
                type="button"
                onClick={() => setOpenFilter(!openFilter)}
                className={s.filterButton}
              >
                <HiOutlineFilter size={18} />
                <span>
                  Role: {roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
                </span>
              </button>

              {openFilter && (
                <div className={s.filterDropdown}>
                  {["all", "buyer", "seller", "admin"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRoleFilter(r);
                        setOpenFilter(false);
                      }}
                      className={s.filterOption(roleFilter === r)}
                    >
                      {r === "all" ? "All Users" : r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Users Table Card */}
          <div className={s.cardContainer}>
            <div className={s.cardHeader}>
              <div className={s.cardTitleRow}>
                <h2 className={s.cardTitle}>Registered Accounts</h2>
                <div className={s.userCount}>
                  Showing <span className={s.userCountSpan}>{filteredUsers.length}</span> users
                </div>
              </div>
            </div>

            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead className={s.thead}>
                  <tr className={s.tableRow}>
                    <th className={s.thUserInfo}>User Info</th>
                    <th className={s.thRole}>Role</th>
                    <th className={s.thContact}>Contact Details</th>
                    <th className={s.thStatus}>Account Status</th>
                    <th className={s.thActions}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="loader" />
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={s.emptyState}>
                        No users found under this filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u._id} className={s.tableRow}>
                        {/* User Info */}
                        <td className={s.tdUserInfo}>
                          <div className="flex items-center gap-3">
                            <div className={s.userAvatar}>
                              {u.profilePic ? (
                                <img
                                  src={u.profilePic}
                                  alt=""
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                u.name?.charAt(0).toUpperCase() || "U"
                              )}
                            </div>
                            <div>
                              <div className={s.userInfoName}>{u.name}</div>
                              <div className={s.userInfoId}>ID: {u._id.slice(-6)}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role Select */}
                        <td className={s.tdRole}>
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u._id, e.target.value)}
                            className={s.roleBadge(u.role)}
                          >
                            <option value="buyer">BUYER</option>
                            <option value="seller">SELLER</option>
                            <option value="admin">ADMIN</option>
                          </select>
                        </td>

                        {/* Contact */}
                        <td className={s.tdContact}>
                          <div className={s.contactWrapper}>
                            <span className={s.contactEmail}>
                              <HiOutlineMail size={16} className="text-primary shrink-0" />
                              {u.email}
                            </span>
                            {u.phone && (
                              <span className={s.contactPhone}>
                                <HiOutlinePhone size={16} className="text-primary shrink-0" />
                                {u.phone}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className={s.tdStatus}>
                          <span
                            className={
                              u.isActive ? s.statusBadgeActive : s.statusBadgeBlocked
                            }
                          >
                            {u.isActive ? "Active" : "Deactivated"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className={s.tdActions}>
                          <div className={s.actionsWrapper}>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u._id)}
                              className={s.blockButton(!u.isActive)}
                              title={u.isActive ? "Deactivate User" : "Activate User"}
                            >
                              {u.isActive ? (
                                <HiOutlineLockClosed size={18} />
                              ) : (
                                <HiOutlineLockOpen size={18} />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u._id)}
                              className={s.deleteButton}
                              title="Delete User"
                            >
                              <HiOutlineTrash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;