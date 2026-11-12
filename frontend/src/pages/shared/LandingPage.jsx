import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiLocationMarker,
  HiOfficeBuilding,
  HiSearch,
  HiShieldCheck,
  HiLightningBolt,
  HiCurrencyDollar,
  HiVideoCamera,
  HiMail,
  HiPhone,
  HiCheck,
  HiHome,
} from "react-icons/hi";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.jsx";
import PropertyCard from "../../components/common/PropertyCard.jsx";
import { landingPageStyles as s } from "../../assets/dummyStyles.js";
import heroImg from "../../assets/bannerimage.png";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, token, API_URL } = useAuth();

  const [properties, setProperties] = useState([]);
  const [propertyCounts, setPropertyCounts] = useState({});
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search filter form states
  const [searchLocation, setSearchLocation] = useState("");
  const [propertyType, setPropertyType] = useState("Select Type");
  const [priceRange, setPriceRange] = useState("Any Price");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [propsRes, countsRes] = await Promise.all([
          axios.get(`${API_URL}/api/property?sort=latest`),
          axios.get(`${API_URL}/api/property/counts`),
        ]);

        if (propsRes.data?.success) {
          setProperties(propsRes.data.properties || []);
        }
        if (countsRes.data?.success) {
          setPropertyCounts(countsRes.data.counts || {});
        }

        // Fetch wishlist if logged in
        if (token) {
          try {
            const wishRes = await axios.get(`${API_URL}/api/wishlist`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (wishRes.data?.success) {
              setWishlistedIds(
                (wishRes.data.wishlist || []).map((p) => String(p._id))
              );
            }
          } catch (e) {
            console.error("Failed to load wishlist:", e);
          }
        }
      } catch (err) {
        console.error("LandingPage fetch error:", err);
        setError("Failed to load listings");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, API_URL]);

  const handleToggleWishlist = async (propertyId) => {
    if (!token) {
      navigate("/login");
      return;
    }
    const idStr = String(propertyId);
    const isSaved = wishlistedIds.includes(idStr);

    try {
      if (isSaved) {
        await axios.delete(`${API_URL}/api/wishlist/${idStr}`);
        setWishlistedIds((prev) => prev.filter((id) => id !== idStr));
      } else {
        await axios.post(`${API_URL}/api/wishlist/${idStr}`);
        setWishlistedIds((prev) => [...prev, idStr]);
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation) params.append("city", searchLocation);
    if (propertyType && propertyType !== "Select Type") {
      params.append("propertyType", propertyType);
    }
    if (priceRange === "Under 50L") params.append("maxPrice", "5000000");
    if (priceRange === "50L - 1Cr") {
      params.append("minPrice", "5000000");
      params.append("maxPrice", "10000000");
    }
    if (priceRange === "1Cr+") params.append("minPrice", "10000000");

    navigate(`/properties?${params.toString()}`);
  };

  const categories = [
    {
      name: "Modern Flats",
      count: propertyCounts.flat || 0,
      icon: <HiOfficeBuilding size={32} />,
      type: "flat",
    },
    {
      name: "Luxury Villas",
      count: propertyCounts.villa || 0,
      icon: <HiHome size={32} />,
      type: "villa",
    },
    {
      name: "Penthouse",
      count: propertyCounts.penthouse || 0,
      icon: <HiOfficeBuilding size={32} />,
      type: "penthouse",
    },
    {
      name: "Commercial",
      count: propertyCounts.commercial || 0,
      icon: <HiOfficeBuilding size={32} />,
      type: "commercial",
    },
  ];

  const features = [
    {
      title: "Verified Trust",
      desc: "Every listing is strictly audited for ownership, condition, and legality.",
      icon: <HiShieldCheck size={28} />,
    },
    {
      title: "Smart Search",
      desc: "Our AI-driven algorithms help you find the best matches based on preferences.",
      icon: <HiLightningBolt size={28} />,
    },
    {
      title: "Best Value",
      desc: "Direct-from-owner listings and zero-commission options to ensure competitive prices.",
      icon: <HiCurrencyDollar size={28} />,
    },
    {
      title: "Virtual Tours",
      desc: "High-definition 3D tours allow you to experience the property from home.",
      icon: <HiVideoCamera size={28} />,
    },
  ];

  return (
    <div className={s.bgMain}>
      {/* 1. Hero Section */}
      <section className={s.heroSection}>
        <div className={s.heroContent}>
          <span className={s.badge}>✨ The Next-Gen Real Estate Experience</span>
          <h1 className={s.heroTitle}>
            Find Your Dream Home With <span className={s.textGradient}>Zero Hassle</span>
          </h1>
          <p className={s.heroSubtitle}>
            Browse verified premium residences, flats, and luxury estates. Connect directly with owners and licensed agents across prime cities.
          </p>

          {/* Search Bar */}
          <form className={s.searchForm} onSubmit={handleSearchSubmit}>
            <div className={s.searchField}>
              <HiLocationMarker size={22} className={s.textPrimary} />
              <div className={s.flexCol}>
                <span className={s.labelSmall}>Location</span>
                <input
                  type="text"
                  placeholder="Enter city or area..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className={s.inputTransparent}
                />
              </div>
            </div>

            <div className={s.searchDivider} />

            <div className={s.searchField}>
              <HiOfficeBuilding size={22} className={s.textPrimary} />
              <div className={s.flexCol}>
                <span className={s.labelSmall}>Property Type</span>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className={`${s.inputTransparent} cursor-pointer`}
                >
                  <option value="Select Type">All Types</option>
                  <option value="flat">Flat/Apartment</option>
                  <option value="villa">Villa/House</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
            </div>

            <div className={s.searchDivider} />

            <div className={s.searchField}>
              <HiCurrencyDollar size={22} className={s.textPrimary} />
              <div className={s.flexCol}>
                <span className={s.labelSmall}>Budget</span>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className={`${s.inputTransparent} cursor-pointer`}
                >
                  <option value="Any Price">Any Price</option>
                  <option value="Under 50L">Under ₹50 Lakh</option>
                  <option value="50L - 1Cr">₹50 Lakh - ₹1 Crore</option>
                  <option value="1Cr+">₹1 Crore +</option>
                </select>
              </div>
            </div>

            <button type="submit" className={s.searchButton}>
              <HiSearch size={20} />
              <span>Search</span>
            </button>
          </form>

          {/* Stats Bar */}
          <div className={s.statsContainer}>
            <div className={s.statItemFlex}>
              <div className={s.statNumber}>1,500+</div>
              <div className={s.statLabel}>Verified Properties</div>
            </div>
            <div className={s.statItemBorder}>
              <div className={s.statNumber}>98%</div>
              <div className={s.statLabel}>Client Satisfaction</div>
            </div>
            <div className={s.statItemBorder}>
              <div className={s.statNumber}>25+</div>
              <div className={s.statLabel}>Major Cities</div>
            </div>
          </div>
        </div>

        {/* Hero Banner Image */}
        <div className={s.heroImageContainer}>
          <div className={s.imageWrapper}>
            <img src={heroImg} alt="Luxury Property" className={s.heroImage} />
            <div className={s.verifiedBadge}>
              <div className={s.badgeIconWrapper}>
                <HiShieldCheck size={24} className="text-primary" />
              </div>
              <div>
                <h4 className={s.badgeTitle}>100% Verified</h4>
                <p className={s.badgeText}>All listings checked for clean titles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Section */}
      <section className={s.categorySection}>
        <div className={s.container}>
          <div className={s.categoryHeader}>
            <div className={s.categoryHeaderText}>
              <h2 className={s.categoryTitle}>Explore by Property Type</h2>
              <p className={s.categoryDesc}>
                Whether you're looking for high-rise city living or private suburban villas, find the right fit.
              </p>
            </div>
            <Link to="/properties" className="btn btn-outline py-3 px-6 rounded-2xl text-sm font-bold">
              View All Properties
            </Link>
          </div>

          <div className={s.categoryGrid}>
            {categories.map((cat) => (
              <div
                key={cat.type}
                className={s.categoryCard}
                onClick={() => navigate(`/properties?propertyType=${cat.type}`)}
              >
                <div className={s.categoryIconWrapper}>{cat.icon}</div>
                <h3 className={s.categoryName}>{cat.name}</h3>
                <p className={s.categoryCount}>{cat.count} Listings available</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Properties Section */}
      <section className={s.featuredSection}>
        <div className={s.container}>
          <div className={s.featuredHeader}>
            <span className={s.featuredBadge}>Exclusive Listings</span>
            <h2 className={s.featuredTitle}>Featured Properties</h2>
            <p className={s.featuredSubtitle}>
              Handpicked residences with prime connectivity, modern amenities, and the best market prices.
            </p>
          </div>

          {loading ? (
            <div className={s.loadingContainer}>
              <div className={s.loader} />
            </div>
          ) : error ? (
            <div className={s.errorContainer}>
              <p>{error}</p>
            </div>
          ) : (
            <div className={s.propertiesGrid}>
              {properties
                .slice(0, 6)
                .map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    isWishlisted={wishlistedIds.includes(String(property._id))}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
            </div>
          )}

          <div className={s.discoverButtonContainer}>
            <Link to="/properties" className={s.discoverButton}>
              Discover All Listings
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Why Choose Us / Features */}
      <section className={s.featuresSection}>
        <div className={s.featuresContainer}>
          <div className={s.featuresContent}>
            <span className="badge bg-primary-light text-primary mb-4 inline-block">
              Why Choose UrbanHaven
            </span>
            <h2 className={s.featuresHeading}>
              Setting New Standards in Property Discovery
            </h2>
            <p className={s.featuresSubtext}>
              We've reinvented the property search experience from the ground up. By focusing on transparency, technological precision, and verified listings, we help you find not just a house, but a true home.
            </p>

            <div className={s.featuresListItems}>
              {[
                "Direct connection with certified owners and agents",
                "Real-time transparent pricing and zero hidden markups",
                "Secure document verification and legal clearance",
                "24/7 Dedicated client assistance and tour scheduling",
              ].map((item, idx) => (
                <div key={idx} className={s.listItem}>
                  <div className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
                    <HiCheck size={16} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <Link to="/properties" className={s.learnMoreLink}>
              Explore Available Properties →
            </Link>
          </div>

          <div className={s.featuresList}>
            {features.map((f, idx) => (
              <div key={idx} className={s.featureCard}>
                <div className={s.featureIconWrapper}>{f.icon}</div>
                <h3 className={s.featureTitle}>{f.title}</h3>
                <p className={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section className={s.processSection}>
        <div className={s.container}>
          <div className={s.processHeader}>
            <span className={s.processBadge}>Simple Process</span>
            <h2 className={s.processTitle}>How It Works</h2>
            <p className={s.processSubtitle}>
              Three straightforward steps between you and your next ideal property.
            </p>
          </div>

          <div className={s.processGrid}>
            {[
              {
                step: "01",
                title: "Smart Search",
                desc: "Filter by location, price, BHK, and amenities to find matching properties tailored to your exact lifestyle.",
                icon: <HiLightningBolt size={36} />,
              },
              {
                step: "02",
                title: "Inspect & Connect",
                desc: "Review detailed floorplans, verified photos, and initiate direct real-time chats with property owners.",
                icon: <HiVideoCamera size={36} />,
              },
              {
                step: "03",
                title: "Close with Confidence",
                desc: "Finalize deals backed by legal verification, clean document records, and professional support.",
                icon: <HiShieldCheck size={36} />,
              },
            ].map((p, idx) => (
              <div key={idx} className={s.processCard}>
                <div className={s.stepNumber}>{p.step}</div>
                <div className={s.processIconWrapper}>{p.icon}</div>
                <h3 className={s.processCardTitle}>{p.title}</h3>
                <p className={s.processCardDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className={s.footer}>
        <div className={s.container}>
          <div className={s.footerMainGrid}>
            {/* Col 1: Brand */}
            <div className={s.footerBrand}>
              <Link to="/" className={s.brandLogo}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-teal-500 flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <span>Urban<span className="text-text-main">Haven</span></span>
              </Link>
              <p className={s.brandDesc}>
                India's premier real estate marketplace connecting buyers and sellers directly with complete transparency, verified listings, and smart tools.
              </p>
              <div className={s.socialIcons}>
                {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, idx) => (
                  <a key={idx} href="#" className={s.socialIcon}>
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <h4 className={s.footerHeading}>Company</h4>
              <ul className={s.footerLinks}>
                <li><Link to="/" className={s.footerLink}>Home</Link></li>
                <li><Link to="/properties" className={s.footerLink}>Browse Properties</Link></li>
                <li><Link to="/contact" className={s.footerLink}>Contact Support</Link></li>
                <li><Link to="/register" className={s.footerLink}>Join as Seller</Link></li>
              </ul>
            </div>

            {/* Col 3: Contact Info */}
            <div>
              <h4 className={s.footerHeading}>Support</h4>
              <ul className={s.footerLinks}>
                <li className={s.contactInfo}>
                  <HiMail className="text-primary text-xl" /> support@urbanhaven.com
                </li>
                <li className={s.contactInfo}>
                  <HiPhone className="text-primary text-xl" /> +91 98765 43210
                </li>
                <li className={s.contactInfoStart}>
                  <HiLocationMarker className={`text-primary ${s.contactIcon}`} />
                  Plot 120, Tech Zone 4, Bhubaneswar, Odisha
                </li>
              </ul>
            </div>

            {/* Col 4: Newsletter */}
            <div>
              <h4 className={s.footerHeading}>Stay Updated</h4>
              <p className={s.newsletterDesc}>
                Subscribe to get alerts on new prime listings and real estate investment insights.
              </p>
              <div className={s.newsletterInputWrapper}>
                <input
                  type="email"
                  placeholder="Your email address"
                  className={s.newsletterInput}
                />
                <button type="button" className={s.newsletterButton}>
                  Join
                </button>
              </div>
            </div>
          </div>

          <div className={s.bottomBar}>
            <div className={s.bottomBarFlex}>
              <p>© {new Date().getFullYear()} UrbanHaven. All rights reserved.</p>
              <div className={s.footerLegalLinks}>
                <a href="#" className="hover:text-primary">Privacy Policy</a>
                <a href="#" className="hover:text-primary">Terms of Service</a>
                <a href="#" className="hover:text-primary">Cookie Settings</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
