import React, { useState } from "react";
import axios from "axios";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiCamera,
  HiX,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import SellerSidebar from "../../components/SellerSidebar.jsx";
import { profileStyles as s, sellerLayoutStyles as ls } from "../../assets/dummyStyles.js";

const Profile = () => {
  const { user, setUser, token, API_URL } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeProfilePic, setRemoveProfilePic] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveProfilePic(false);
    }
  };

  const handleRemovePhoto = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveProfilePic(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("phone", formData.phone);
      payload.append("address", formData.address);

      if (imageFile) {
        payload.append("profilePic", imageFile);
      }
      if (removeProfilePic) {
        payload.append("removeProfilePic", "true");
      }

      const res = await axios.put(`${API_URL}/api/auth/profile`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        setUser(res.data.user);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const displayAvatar =
    imagePreview ||
    (!removeProfilePic && user?.profilePic) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "User"
    )}&background=0d9488&color=fff`;

  const profileContent = (
    <div className={s.mainContainer(user?.role)}>
      <div className={s.header}>
        <h1 className={s.pageTitle}>Account Profile</h1>
        <p className={s.pageSubtitle}>Manage your personal credentials and contact settings</p>
      </div>

      <div className={s.card}>
        {error && <div className={s.errorMessage}>{error}</div>}

        <div className={s.profileHeader}>
          <div className={s.avatarSection}>
            <div className={s.avatarWrapper}>
              <img src={displayAvatar} alt="Profile" className={s.avatarImage} />
            </div>

            {isEditing && (
              <>
                <label className={s.uploadButton} title="Upload photo">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <HiCamera size={18} />
                </label>

                {(imagePreview || user?.profilePic) && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className={s.removeButton}
                    title="Remove photo"
                  >
                    <HiX size={16} />
                  </button>
                )}
              </>
            )}
          </div>

          <div>
            <h2 className={s.userName}>{user?.name}</h2>
            <span className={s.roleBadge}>
              {user?.role?.toUpperCase()} ACCOUNT
            </span>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className={s.editForm}>
            <div>
              <label className={s.label}>Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className={s.input}
              />
            </div>

            <div>
              <label className={s.label}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={s.input}
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className={s.label}>Postal Address</label>
              <textarea
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                className={s.textarea}
                placeholder="Street name, landmark, city, pincode..."
              />
            </div>

            <div className={s.formActions}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className={s.cancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={s.saveButton}
              >
                {loading ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className={s.infoSection}>
            <div className={s.infoItem}>
              <div className={s.infoIcon}>
                <HiOutlineUser size={22} />
              </div>
              <div>
                <p className={s.infoLabel}>Full Name</p>
                <p className={s.infoValue}>{user?.name || "Not provided"}</p>
              </div>
            </div>

            <div className={s.infoItem}>
              <div className={s.infoIcon}>
                <HiOutlineMail size={22} />
              </div>
              <div>
                <p className={s.infoLabel}>Email Address</p>
                <p className={s.infoValue}>{user?.email}</p>
              </div>
            </div>

            <div className={s.infoItem}>
              <div className={s.infoIcon}>
                <HiOutlinePhone size={22} />
              </div>
              <div>
                <p className={s.infoLabel}>Phone Number</p>
                <p className={s.infoValue}>{user?.phone || "No phone linked"}</p>
              </div>
            </div>

            <div className={s.infoItem}>
              <div className={s.infoIcon}>
                <HiOutlineLocationMarker size={22} />
              </div>
              <div>
                <p className={s.infoLabel}>Mailing Address</p>
                <p className={s.infoValue}>{user?.address || "No address added"}</p>
              </div>
            </div>

            <div className={s.editButtonWrapper}>
              <button
                onClick={() => setIsEditing(true)}
                className={s.editProfileButton}
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (user?.role === "seller") {
    return (
      <div className={ls.container}>
        <SellerSidebar isOpen={false} onClose={() => {}} />
        <div className={ls.contentWrapper}>
          <main className={ls.main}>{profileContent}</main>
        </div>
      </div>
    );
  }

  return <div className={s.containerWrapper(user?.role)}>{profileContent}</div>;
};

export default Profile;