import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HiUpload, HiX } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import SellerSidebar from "../../components/SellerSidebar.jsx";
import { addPropertyStyles as s, sellerLayoutStyles as ls } from "../../assets/dummyStyles.js";

const AddProperty = () => {
  const navigate = useNavigate();
  const { token, API_URL } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    area: "",
    pincode: "",
    propertyType: "flat",
    bhk: "2",
    bathrooms: "2",
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newFiles = [...images, ...files].slice(0, 8);
    setImages(newFiles);

    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newFiles = images.filter((_, i) => i !== index);
    setImages(newFiles);
    setImagePreviews(newFiles.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "amenities") {
          payload.append("amenities", JSON.stringify(formData.amenities));
        } else {
          payload.append(key, formData[key]);
        }
      });

      images.forEach((img) => {
        payload.append("images", img);
      });

      const res = await axios.post(`${API_URL}/api/property`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Add property error:", err);
      setError(err.response?.data?.message || "Failed to publish property listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={ls.container}>
      <SellerSidebar isOpen={false} onClose={() => {}} />

      <div className={ls.contentWrapper}>
        <main className={ls.main}>
          <div className={s.innerContainer}>
            <div className={s.header}>
              <h1 className={s.heading}>Create Property Listing</h1>
              <p className={s.subheading}>
                Provide thorough details and images to attract verified buyers faster.
              </p>
            </div>

            {error && <div className={s.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={s.form}>
              {/* Section 1: Basic Information */}
              <div className={s.section}>
                <div className={`${s.sectionHeader} ${s.sectionHeaderLargeMargin}`}>
                  <div className={s.sectionBar} />
                  <h3 className={s.sectionTitle}>Basic Information</h3>
                </div>

                <div className={s.contentGroupLarge}>
                  <div>
                    <label className={s.label}>Property Title</label>
                    <input
                      type="text"
                      name="title"
                      required
                      placeholder="e.g. Luxurious 3BHK Penthouse with Panoramic Views"
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
                      placeholder="Detail features, nearby landmarks, schools, hospitals, and natural light..."
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`${s.input} ${s.textarea}`}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Property Specs & Pricing */}
              <div className={s.twoColumnGrid}>
                {/* Specs */}
                <div>
                  <div className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}>
                    <div className={s.sectionBar} />
                    <h3 className={s.sectionTitle}>Specifications</h3>
                  </div>

                  <div className={s.contentGroupMedium}>
                    <div>
                      <label className={s.label}>Property Type</label>
                      <select
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleInputChange}
                        className={`${s.input} ${s.select}`}
                      >
                        <option value="flat">Flat/Apartment</option>
                        <option value="villa">Independent House/Villa</option>
                        <option value="penthouse">Penthouse</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>

                    <div className={s.gridThreeCol}>
                      <div>
                        <label className={s.label}>BHK</label>
                        <input
                          type="number"
                          name="bhk"
                          min="1"
                          max="10"
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
                          min="1"
                          max="10"
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
                          placeholder="e.g. 1450"
                          value={formData.areaSize}
                          onChange={handleInputChange}
                          className={s.input}
                        />
                      </div>
                    </div>

                    <div className={s.gridTwoCol}>
                      <div>
                        <label className={s.label}>Furnishing</label>
                        <select
                          name="furnishing"
                          value={formData.furnishing}
                          onChange={handleInputChange}
                          className={`${s.input} ${s.select}`}
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
                          className={`${s.input} ${s.select}`}
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
                  <div className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}>
                    <div className={s.sectionBar} />
                    <h3 className={s.sectionTitle}>Location & Price</h3>
                  </div>

                  <div className={s.contentGroupMedium}>
                    <div>
                      <label className={s.label}>Total Price (₹)</label>
                      <input
                        type="number"
                        name="price"
                        required
                        placeholder="e.g. 7500000"
                        value={formData.price}
                        onChange={handleInputChange}
                        className={s.input}
                      />
                    </div>

                    <div className={s.gridTwoCol}>
                      <div>
                        <label className={s.label}>City</label>
                        <input
                          type="text"
                          name="city"
                          required
                          placeholder="e.g. Bhubaneswar"
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
                          placeholder="e.g. 751024"
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
                        placeholder="e.g. Patia, Infocity Road"
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
                <div className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}>
                  <div className={s.sectionBar} />
                  <h3 className={s.sectionTitle}>Amenities & Features</h3>
                </div>

                <div className={s.amenitiesGrid}>
                  {commonAmenities.map((amenity) => {
                    const isChecked = formData.amenities.includes(amenity);
                    return (
                      <label
                        key={amenity}
                        className={`${s.amenityLabelBase} ${
                          isChecked ? s.amenityLabelActive : s.amenityLabelInactive
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleAmenityChange(amenity)}
                          className={s.amenityCheckbox}
                        />
                        <span
                          className={`${s.amenityTextBase} ${
                            isChecked ? s.amenityTextActive : s.amenityTextInactive
                          }`}
                        >
                          {amenity}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Image Upload */}
              <div className={s.section}>
                <div className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}>
                  <div className={s.sectionBar} />
                  <h3 className={s.sectionTitle}>Property Photos</h3>
                </div>

                <label className={s.uploadArea}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className={s.uploadIconWrapper}>
                    <HiUpload size={36} className="text-primary" />
                  </div>
                  <h4 className={s.uploadTitle}>Click to upload property photos</h4>
                  <p className={s.uploadSubtext}>Upload up to 8 high-resolution photos (JPEG, PNG)</p>
                </label>

                {imagePreviews.length > 0 && (
                  <div className={s.previewsGrid}>
                    {imagePreviews.map((src, i) => (
                      <div key={i} className={s.previewItem}>
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className={s.removeButton}
                        >
                          <HiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className={s.footerButtons}>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className={s.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={s.submitButton}
                >
                  {loading ? "Publishing..." : "Publish Listing"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddProperty;
