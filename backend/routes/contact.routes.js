import express from "express";
import {
  submitContact,
  getContacts,
  deleteContact,
} from "../controllers/contact.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", submitContact);
router.get("/", protect, authorize("admin"), getContacts);
router.delete("/:id", protect, authorize("admin"), deleteContact);

export default router;
