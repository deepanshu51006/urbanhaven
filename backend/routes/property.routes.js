import express from "express";
import {
  getAllProperties,
  getPropertyCounts,
  getPropertyDetails,
  addProperty,
  updateProperty,
  updatePropertyStatus,
  deleteProperty,
  getSellerProperties,
  getSellerDashboardStats,
} from "../controllers/property.controller.js";
import { protect, authorize, upload } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllProperties);
router.get("/counts", getPropertyCounts);

// Seller specific routes (placed before :id to prevent param collision)
router.get(
  "/seller/my-properties",
  protect,
  authorize("seller", "admin"),
  getSellerProperties
);
router.get(
  "/seller/stats",
  protect,
  authorize("seller", "admin"),
  getSellerDashboardStats
);

// Single property details
router.get("/:id", getPropertyDetails);

// Protected routes (Seller / Admin)
router.post(
  "/",
  protect,
  authorize("seller", "admin"),
  upload.array("images", 10),
  addProperty
);

router.put(
  "/:id",
  protect,
  authorize("seller", "admin"),
  upload.array("images", 10),
  updateProperty
);

router.patch(
  "/:id/status",
  protect,
  authorize("seller", "admin"),
  updatePropertyStatus
);

router.delete(
  "/:id",
  protect,
  authorize("seller", "admin"),
  deleteProperty
);

export default router;
