import express from "express";
import User from "../models/user.model.js";
import Property from "../models/property.model.js";
import Inquiry from "../models/inquiry.model.js";
import Contact from "../models/contact.model.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Require admin for all admin routes
router.use(protect, authorize("admin"));

// @desc    Get system wide overview statistics
// @route   GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const activeListings = await Property.countDocuments({ status: "sale" });
    const soldProperties = await Property.countDocuments({ status: "sold" });
    const totalInquiries = await Inquiry.countDocuments();
    const totalContacts = await Contact.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProperties,
        activeListings,
        soldProperties,
        totalInquiries,
        totalContacts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all users with role filtering
// @route   GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role && role !== "all") {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    const users = await User.find(query).select("-password").sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({ success: true, message: "User role updated", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Toggle user active/deactive status
// @route   PATCH /api/admin/users/:id/status
router.patch("/users/:id/status", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Approve/Reject seller request
// @route   PATCH /api/admin/users/:id/approve-seller
router.patch("/users/:id/approve-seller", async (req, res) => {
  try {
    const { isSellerApproved } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isSellerApproved = isSellerApproved !== undefined ? isSellerApproved : true;
    await user.save();

    res.json({
      success: true,
      message: `Seller status updated`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Verify or unverify property listing
// @route   PATCH /api/admin/properties/:id/verify
router.patch("/properties/:id/verify", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    property.isVerified = !property.isVerified;
    await property.save();

    res.json({
      success: true,
      message: `Property ${property.isVerified ? "verified" : "unverified"}`,
      property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
