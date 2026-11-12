import React, { useState } from "react";
import axios from "axios";
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiCheckCircle,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import { contactStyles as s } from "../../assets/dummyStyles.js";

const Contact = () => {
  const { user, API_URL } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "buyer",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/contact`, formData);
      if (res.data?.success) {
        setSuccess(true);
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
          role: user?.role || "buyer",
          message: "",
        });
      }
    } catch (err) {
      console.error("Submit contact error:", err);
      setError(err.response?.data?.message || "Failed to deliver message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.container}>
      <div className={s.mainContainer}>
        {/* Header */}
        <div className={s.header}>
          <h1 className={s.heading}>Contact Our Team</h1>
          <p className={s.subheading}>
            Have questions about buying, listing, or verifying a property? Reach out and we'll connect with you directly.
          </p>
        </div>

        {/* Content Grid */}
        <div className={s.grid}>
          {/* Contact Details Column */}
          <div className={s.contactInfoContainer}>
            <div className={s.contactInfoCard}>
              <div className={`${s.contactItem} ${s.contactItemMarginBottom}`}>
                <div className={s.contactIconWrapper}>
                  <HiOutlineMail size={22} />
                </div>
                <div>
                  <h4 className={s.contactTitle}>Email Us</h4>
                  <p className={s.contactDetail}>contact@urbanhaven.com</p>
                </div>
              </div>

              <div className={`${s.contactItem} ${s.contactItemMarginBottom}`}>
                <div className={s.contactIconWrapperAlt}>
                  <HiOutlinePhone size={22} />
                </div>
                <div>
                  <h4 className={s.contactTitle}>Direct Line</h4>
                  <p className={s.contactDetail}>+91 98765 43210 (Mon-Sat, 9am - 7pm)</p>
                </div>
              </div>

              <div className={s.contactItem}>
                <div className={s.contactIconWrapper}>
                  <HiOutlineLocationMarker size={22} />
                </div>
                <div>
                  <h4 className={s.contactTitle}>Office Headquarters</h4>
                  <p className={s.contactDetail}>Plot 120, Tech Zone 4, Bhubaneswar, Odisha</p>
                </div>
              </div>
            </div>

            <div className={s.quickSupportCard}>
              <h3 className={s.quickSupportTitle}>Verified Assurance</h3>
              <p className={s.quickSupportText}>
                Every listed property undergoes physical title and documentation review before reaching prospective buyers.
              </p>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className={s.formCard}>
            {success ? (
              <div className={s.successContainer}>
                <HiCheckCircle size={64} className={s.successIcon} />
                <h3 className={s.successTitle}>Message Received</h3>
                <p className={s.successMessage}>
                  Thank you for reaching out! Our advisory team will review your message and reply via email or phone shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className={s.successButton}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={s.form}>
                {error && <div className={s.errorMessage}>{error}</div>}

                <div className={s.formTwoColGrid}>
                  <div>
                    <label className={s.label}>Your Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Rachit Srivastava"
                      value={formData.name}
                      onChange={handleChange}
                      className={s.input}
                    />
                  </div>

                  <div>
                    <label className={s.label}>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={s.input}
                    />
                  </div>
                </div>

                <div className={s.formTwoColGrid}>
                  <div>
                    <label className={s.label}>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className={s.input}
                    />
                  </div>

                  <div>
                    <label className={s.label}>You are a</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={s.input}
                    >
                      <option value="buyer">Prospective Buyer / Tenant</option>
                      <option value="seller">Property Owner / Seller</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={s.label}>Your Message</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Describe how we can assist you with your property inquiry..."
                    value={formData.message}
                    onChange={handleChange}
                    className={`${s.input} ${s.textarea}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={s.submitButton}
                >
                  {loading ? "Sending Message..." : "Submit Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;