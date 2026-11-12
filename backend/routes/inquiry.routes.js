import express from "express";
import {
  createInquiry,
  getSellerInquiries,
  getUserInquiries,
  getAllInquiries,
  deleteInquiry,
} from "../controllers/inquiry.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createInquiry);
router.get("/seller", protect, authorize("seller", "admin"), getSellerInquiries);
router.get("/my", protect, getUserInquiries);
router.get("/admin/all", protect, authorize("admin"), getAllInquiries);
router.delete("/:id", protect, deleteInquiry);

export default router;
