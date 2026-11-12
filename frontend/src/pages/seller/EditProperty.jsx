import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { HiUpload, HiX } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import SellerSidebar from "../../components/SellerSidebar.jsx";
import { editPropertyStyles as s, sellerLayoutStyles as ls } from "../../assets/dummyStyles.js";

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API_URL } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    area: "",
    pincode: "",
    propertyType: "flat",
    bhk: "",
    bathrooms: "",
    areaSize: "",
    furnishing: "unfurnished",
    status: "sale",
    amenities: [],
  });

  const commonAmenities = [
    "Parking",
    "Swimming Pool",
    "Gym",
    "24/7 Security",
    "High-Speed Wifi",
    "Power Backup",
    "Club House",
    "Garden / Park",
    "Elevator",
    "Water Storage",
  ];

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/property/${id}`);
        if (res.data?.success) {
          const p = res.data.property;
          setFormData({
            title: p.title || "",
            description: p.description || "",
            price: p.price || "",
            city: p.city || "",
            area: p.area || "",
            pincode: p.pincode || "",
            propertyType: p.propertyType || "flat",
            bhk: p.bhk || "",
            bathrooms: p.bathrooms || "",
            areaSize: p.areaSize || "",
            furnishing: p.furnishing || "unfurnished",
            status: p.status || "sale",
            amenities: p.amenities || [],
          });
          setExistingImages(p.images || []);
        }
      } catch (err) {
        console.error("Fetch property error:", err);
        setError("Could not load property details");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, API_URL]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => {
      const current = prev.amenities || [];
      if (current.includes(amenity)) {
        return { ...prev, amenities: current.filter((a) => a !== amenity) };
      } else {
        return { ...prev, amenities: [...current, amenity] };
      }
    });
  };

  const removeExistingImage = (src) => {
    setExistingImages((prev) => prev.filter((img) => img !== src));
  };

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const combined = [...newImages, ...files].slice(
      0,
      10 - existingImages.length
    );
    setNewImages(combined);
    setNewImagePreviews(combined.map((file) => URL.createObjectURL(file)));
  };

  const removeNewImage = (index) => {
    const updated = newImages.filter((_, i) => i !== index);
    setNewImages(updated);
    setNewImagePreviews(updated.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "amenities") {
          payload.append("amenities", JSON.stringify(formData.amenities));
        } else {
          payload.append(key, formData[key]);
        }
      });

      payload.append("existingImages", JSON.stringify(existingImages));

      newImages.forEach((file) => {
        payload.append("images", file);
      });

      const res = await axios.put(`${API_URL}/api/property/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Failed to update property");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loader-full-page">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className={ls.container}>
      <SellerSidebar isOpen={false} onClose={() => {}} />

      <div className={ls.contentWrapper}>
        <main className={ls.main}>
          <div className={s.innerContainer}>
            <div className={s.headerWrapper}>
              <h1 className={s.pageTitle}>Edit Property Listing</h1>
              <p className={s.pageSubtitle}>Update information, pricing, or photos for this property.</p>
            </div>

            {error && (
              <div className="p-4 bg-red-100 text-red-600 rounded-xl mb-8">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={s.formContainer}>
              {/* Section 1: Basic Information */}
              <div className={s.section}>
                <div className={s.sectionHeader}>
                  <div className={s.sectionIndicator} />
                  <h3 className={s.sectionTitle}>Basic Information</h3>
                </div>

                <div className={s.sectionContent}>
                  <div>
                    <label className={s.label}>Title</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className={s.input}
                    />
                  </div>

                  <div>
                    <label className={s.label}>Description</label>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className={s.textarea}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Property Specs & Pricing */}
              <div className={s.twoColumnGrid}>
                {/* Specs */}
                <div>
                  <div className={s.sectionHeader}>
                    <div className={s.sectionIndicator} />
                    <h3 className={s.sectionTitle}>Specifications</h3>
                  </div>

                  <div className={s.sectionContent}>
                    <div>
                      <label className={s.label}>Property Type</label>
                      <select
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleInputChange}
                        className={s.select}
                      >
                        <option value="flat">Flat/Apartment</option>
                        <option value="villa">Independent House/Villa</option>
                        <option value="penthouse">Penthouse</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>

                    <div className={s.threeColumnGrid}>
                      <div>
                        <label className={s.label}>BHK</label>
                        <input
                          type="number"
                          name="bhk"
                          value={formData.bhk}
                          onChange={handleInputChange}
                          className={s.input}
                        />
                      </div>
                      <div>
                        <label className={s.label}>Bathrooms</label>
                        <input
                          type="number"
                          name="bathrooms"
                          value={formData.bathrooms}
                          onChange={handleInputChange}
                          className={s.input}
                        />
                      </div>
                      <div>
                        <label className={s.label}>Area (Sq Ft)</label>
                        <input
                          type="number"
                          name="areaSize"
                          required
                          value={formData.areaSize}
                          onChange={handleInputChange}
                          className={s.input}
                        />
                      </div>
                    </div>

                    <div className={s.twoColumnGridInner}>
                      <div>
                        <label className={s.label}>Furnishing</label>
                        <select
                          name="furnishing"
                          value={formData.furnishing}
                          onChange={handleInputChange}
                          className={s.select}
                        >
                          <option value="unfurnished">Unfurnished</option>
                          <option value="semi-furnished">Semi-Furnished</option>
                          <option value="furnished">Fully Furnished</option>
                        </select>
                      </div>
                      <div>
                        <label className={s.label}>Status</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className={s.select}
                        >
                          <option value="sale">For Sale</option>
                          <option value="sold">Sold</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location & Pricing */}
                <div>
                  <div className={s.sectionHeader}>
                    <div className={s.sectionIndicator} />
                    <h3 className={s.sectionTitle}>Pricing & Location</h3>
                  </div>

                  <div className={s.sectionContent}>
                    <div>
                      <label className={s.label}>Price (₹)</label>
                      <input
                        type="number"
                        name="price"
                        required
                        value={formData.price}
                        onChange={handleInputChange}
                        className={s.input}
                      />
                    </div>

                    <div className={s.twoColumnGridInner}>
                      <div>
                        <label className={s.label}>City</label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleInputChange}
                          className={s.input}
                        />
                      </div>
                      <div>
                        <label className={s.label}>Pincode</label>
                        <input
                          type="text"
                          name="pincode"
                          required
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className={s.input}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={s.label}>Area / Neighborhood</label>
                      <input
                        type="text"
                        name="area"
                        required
                        value={formData.area}
                        onChange={handleInputChange}
                        className={s.input}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Amenities */}
              <div className={s.section}>
                <div className={s.sectionHeader}>
                  <div className={s.sectionIndicator} />
                  <h3 className={s.sectionTitle}>Amenities & Features</h3>
                </div>

                <div className={s.amenitiesGrid}>
                  {commonAmenities.map((amenity) => {
                    const isChecked = formData.amenities.includes(amenity);
                    return (
                      <label
                        key={amenity}
                        className={s.amenityLabel(isChecked)}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleAmenityChange(amenity)}
                          className={s.amenityCheckbox}
                        />
                        <span className={s.amenityText(isChecked)}>
                          {amenity}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Image Management */}
              <div className={s.section}>
                <div className={s.sectionHeader}>
                  <div className={s.sectionIndicator} />
                  <h3 className={s.sectionTitle}>Image Management</h3>
                </div>

                <div className={s.imageGrid}>
                  {/* Existing Images */}
                  {existingImages.map((src, i) => (
                    <div key={`existing-${i}`} className={s.imageCard}>
                      <img src={src} alt="Existing" className={s.imageCardImg} />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(src)}
                        className={s.removeImageBtn}
                      >
                        <HiX size={12} />
                      </button>
                      <div className={s.imageBadgeExisting}>EXISTING</div>
                    </div>
                  ))}

                  {/* New Image Previews */}
                  {newImagePreviews.map((src, i) => (
                    <div key={`new-${i}`} className={s.imageCardNew}>
                      <img src={src} alt="New Preview" className={s.imageCardImg} />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className={s.removeImageBtn}
                      >
                        <HiX size={12} />
                      </button>
                      <div className={s.imageBadgeNew}>NEW</div>
                    </div>
                  ))}

                  {/* Add Image Card */}
                  {existingImages.length + newImages.length < 10 && (
                    <div className={s.uploadCard}>
                      <input
                        type="file"
                        multiple
                        onChange={handleNewImageChange}
                        className={s.uploadInput}
                        accept="image/*"
                      />
                      <HiUpload size={22} color="#64748b" />
                      <span className={s.uploadText}>Add Photos</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className={s.formActions}>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className={s.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={s.submitButton}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditProperty;
