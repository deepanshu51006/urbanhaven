import jwt from "jsonwebtoken";
import Property from "../models/property.model.js";
import Inquiry from "../models/inquiry.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// @desc    Get all properties with filtering, search & sorting
// @route   GET /api/property
export const getAllProperties = async (req, res) => {
  try {
    const {
      city,
      area,
      pincode,
      propertyType,
      bhk,
      furnishing,
      status,
      minPrice,
      maxPrice,
      amenities,
      sort,
      seller,
      search,
    } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (seller) query.seller = seller;
    if (city) query.city = new RegExp(city, "i");
    if (area) query.area = new RegExp(area, "i");
    if (pincode) query.pincode = pincode;

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { city: new RegExp(search, "i") },
        { area: new RegExp(search, "i") },
        { propertyType: new RegExp(search, "i") },
      ];
    }

    if (propertyType) {
      const types = propertyType.toLowerCase().split(",").map((t) => t.trim());
      query.propertyType = { $in: types };
    }

    if (bhk) {
      if (bhk === "5+") {
        query.bhk = { $gte: "5" };
      } else {
        query.bhk = bhk;
      }
    }

    if (furnishing) {
      const furnishingArray = furnishing.split(",").map((f) => f.trim());
      query.furnishing = {
        $in: furnishingArray.map((f) => new RegExp(`^${f}$`, "i")),
      };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && !isNaN(minPrice)) query.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(maxPrice)) query.price.$lte = Number(maxPrice);
      if (Object.keys(query.price).length === 0) delete query.price;
    }

    if (amenities) {
      const amenitiesList = amenities.split(",").map((a) => a.trim());
      query.amenities = {
        $in: amenitiesList,
      };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "priceLow") sortOption = { price: 1 };
    if (sort === "priceHigh") sortOption = { price: -1 };
    if (sort === "latest") sortOption = { createdAt: -1 };

    const properties = await Property.find(query)
      .populate("seller", "name phone profilePic")
      .sort(sortOption);

    res.json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error("GET_PROPERTIES_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching properties",
      error: error.message,
    });
  }
};

// @desc    Get property counts grouped by propertyType
// @route   GET /api/property/counts
export const getPropertyCounts = async (req, res) => {
  try {
    const counts = await Property.aggregate([
      { $match: { status: "sale" } },
      { $group: { _id: "$propertyType", count: { $sum: 1 } } },
    ]);

    const formattedCounts = counts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.json({
      success: true,
      counts: formattedCounts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single property details by ID
// @route   GET /api/property/:id
export const getPropertyDetails = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "seller",
      "name email phone profilePic"
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // View tracking
    let visitorId = req.ip || "anonymous";
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "super_secret_jwt_key_realstate_platform_2026_dev"
        );
        visitorId = decoded.id;
      } catch (err) {
        // ignore
      }
    }

    const isSellerChecking = property.seller?._id?.toString() === visitorId;
    if (!isSellerChecking && !property.viewedBy.includes(visitorId)) {
      property.views = (property.views || 0) + 1;
      property.viewedBy.push(visitorId);
      await property.save();
    }

    const similarProperties = await Property.find({
      _id: { $ne: property._id },
      city: property.city,
      propertyType: property.propertyType,
      status: "sale",
    })
      .limit(4)
      .select("title price images city area propertyType bhk areaSize status");

    res.json({
      success: true,
      property,
      similarProperties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add new property
// @route   POST /api/property
export const addProperty = async (req, res) => {
  try {
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "properties");
        imageUrls.push(result.secure_url);
      }
    }

    // Parse amenities
    let parsedAmenities = [];
    if (req.body.amenities) {
      if (Array.isArray(req.body.amenities)) {
        parsedAmenities = req.body.amenities;
      } else {
        try {
          parsedAmenities = JSON.parse(req.body.amenities);
        } catch (e) {
          parsedAmenities = req.body.amenities.split(",").map((a) => a.trim());
        }
      }
    }

    const property = await Property.create({
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      city: req.body.city,
      area: req.body.area,
      pincode: req.body.pincode,
      propertyType: req.body.propertyType,
      bhk: req.body.bhk ? String(req.body.bhk) : undefined,
      bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : undefined,
      areaSize: req.body.areaSize ? Number(req.body.areaSize) : undefined,
      furnishing: req.body.furnishing || "unfurnished",
      status: req.body.status || "sale",
      images: imageUrls,
      seller: req.user._id,
      amenities: parsedAmenities,
    });

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.error("ADD_PROPERTY_ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error while adding property",
    });
  }
};

// @desc    Update property
// @route   PUT /api/property/:id
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check ownership or admin
    if (
      property.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this property",
      });
    }

    const fields = [
      "title",
      "description",
      "price",
      "city",
      "area",
      "pincode",
      "propertyType",
      "bhk",
      "bathrooms",
      "areaSize",
      "furnishing",
      "status",
      "amenities",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "amenities" && typeof req.body[field] === "string") {
          try {
            property[field] = JSON.parse(req.body[field]);
          } catch (e) {
            property[field] = req.body[field].split(",").map((a) => a.trim());
          }
        } else if (field === "price" || field === "areaSize" || field === "bathrooms") {
          property[field] = Number(req.body[field]);
        } else {
          property[field] = req.body[field];
        }
      }
    });

    // Handle existing images
    if (req.body.existingImages) {
      try {
        const existing = JSON.parse(req.body.existingImages);
        property.images = Array.isArray(existing) ? existing : property.images;
      } catch (e) {
        console.error("Failed to parse existingImages:", e);
      }
    }

    // Upload any new images
    if (req.files && req.files.length > 0) {
      let newImages = [];
      for (let file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "properties");
        newImages.push(result.secure_url);
      }
      property.images = [...property.images, ...newImages];
    }

    await property.save();

    res.json({
      success: true,
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update property listing status (sale / sold)
// @route   PATCH /api/property/:id/status
export const updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    if (
      property.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    property.status = status;
    await property.save();

    res.json({ success: true, message: "Status updated", property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/property/:id
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    if (
      property.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Property removed successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get properties listed by the logged in seller
// @route   GET /api/property/seller/my-properties
export const getSellerProperties = async (req, res) => {
  try {
    const properties = await Property.find({ seller: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard statistics for the logged in seller
// @route   GET /api/property/seller/stats
export const getSellerDashboardStats = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Calculate total views across all properties
    const viewsData = await Property.aggregate([
      { $match: { seller: sellerId } },
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);
    const totalViews = viewsData.length > 0 ? viewsData[0].totalViews : 0;

    // Active listings (sale)
    const activeListings = await Property.countDocuments({
      seller: sellerId,
      status: "sale",
    });

    // Sold properties
    const soldProperties = await Property.countDocuments({
      seller: sellerId,
      status: "sold",
    });

    // Inquiries received
    const totalInquiries = await Inquiry.countDocuments({
      seller: sellerId,
    });

    res.json({
      success: true,
      stats: {
        totalViews,
        activeListings,
        soldProperties,
        totalInquiries,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
