import express from "express";
import User from "../models/user.model.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// @desc    Get user's wishlist
// @route   GET /api/wishlist
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      populate: { path: "seller", select: "name phone profilePic" },
    });

    res.json({
      success: true,
      count: user.wishlist.length,
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add property to wishlist
// @route   POST /api/wishlist/:propertyId
router.post("/:propertyId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const propertyId = req.params.propertyId;

    if (!user.wishlist.includes(propertyId)) {
      user.wishlist.push(propertyId);
      await user.save();
    }

    res.json({
      success: true,
      message: "Property added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Remove property from wishlist
// @route   DELETE /api/wishlist/:propertyId
router.delete("/:propertyId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const propertyId = req.params.propertyId;

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== propertyId.toString()
    );
    await user.save();

    res.json({
      success: true,
      message: "Property removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
