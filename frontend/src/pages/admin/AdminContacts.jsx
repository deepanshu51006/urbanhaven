import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineTrash,
  HiOutlineMenu,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import {
  adminContactsStyles as s,
  adminLayoutStyles as ls,
  dashboardNavbarStyles as ns,
} from "../../assets/dummyStyles.js";

const AdminContacts = () => {
  const { API_URL } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/contact`);
      if (res.data?.success) {
        setContacts(res.data.contacts || []);
      }
    } catch (err) {
      console.error("Fetch contacts error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this contact message?")) return;
    try {
      await axios.delete(`${API_URL}/api/contact/${id}`);
      setContacts((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert("Failed to delete contact entry.");
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
          <div className="mb-8">
            <h1 className={s.heading}>Contact Form Submissions</h1>
            <p className={s.subheading}>
              Review direct inquiries, feedback, and support tickets sent via the public contact form.
            </p>
          </div>

          <div className={s.card}>
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>Inbox ({contacts.length})</h2>
            </div>

            {loading ? (
              <div className="py-20 text-center"><div className="loader" /></div>
            ) : contacts.length === 0 ? (
              <div className={s.emptyState}>
                <p>No messages received yet.</p>
              </div>
            ) : (
              <div className={s.contactList}>
                {contacts.map((contact, index) => (
                  <div
                    key={contact._id}
                    className={s.contactItem(index, contacts.length)}
                  >
                    <div className={s.contactHeader}>
                      <div className="flex items-center gap-4">
                        <div className={s.avatarWrapper(contact.role)}>
                          {contact.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={s.nameBadgeContainer}>
                            <h3 className={s.name}>{contact.name}</h3>
                            <span className={s.roleBadge(contact.role)}>
                              {contact.role}
                            </span>
                          </div>
                          <div className={s.contactDetails}>
                            <span className={s.detailItem}>
                              <HiOutlineMail size={16} /> {contact.email}
                            </span>
                            {contact.phone && (
                              <span className={s.detailItem}>
                                <HiOutlinePhone size={16} /> {contact.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs text-text-muted">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(contact._id)}
                          className="text-[#dc2626] hover:bg-red-50 p-2 rounded-lg"
                          title="Delete message"
                        >
                          <HiOutlineTrash size={18} />
                        </button>
                      </div>
                    </div>

                    <div className={s.messageBox}>
                      "{contact.message}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminContacts;
