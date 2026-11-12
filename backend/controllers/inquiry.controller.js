import Inquiry from "../models/inquiry.model.js";
import Property from "../models/property.model.js";

// @desc    Create a new inquiry on a property
// @route   POST /api/inquiry
export const createInquiry = async (req, res) => {
  try {
    const { propertyId, message, name, email, phone } = req.body;

    if (!propertyId || !message) {
      return res.status(400).json({
        success: false,
        message: "Property ID and message are required",
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    const inquiry = await Inquiry.create({
      property: propertyId,
      buyer: req.user._id,
      seller: property.seller,
      name: name || req.user.name,
      email: email || req.user.email,
      phone: phone || req.user.phone || "",
      message,
    });

    res.status(201).json({
      success: true,
      message: "Inquiry sent to the seller successfully",
      inquiry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get inquiries received by seller
// @route   GET /api/inquiry/seller
export const getSellerInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ seller: req.user._id })
      .populate("buyer", "name email phone profilePic")
      .populate("property", "title price images city area")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get buyer's submitted inquiries
// @route   GET /api/inquiry/my
export const getUserInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ buyer: req.user._id })
      .populate("seller", "name email phone profilePic")
      .populate("property", "title price images city area")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all inquiries (Admin)
// @route   GET /api/inquiry/admin/all
export const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate("buyer", "name email phone")
      .populate("seller", "name email phone")
      .populate("property", "title price city area")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/inquiry/:id
export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    if (
      inquiry.seller.toString() !== req.user._id.toString() &&
      inquiry.buyer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Inquiry.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Inquiry removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
