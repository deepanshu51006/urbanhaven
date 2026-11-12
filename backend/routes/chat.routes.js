import express from "express";
import Chat from "../models/chat.model.js";
import { protect, upload } from "../middleware/auth.middleware.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const router = express.Router();

// @desc    Create or retrieve existing chat between buyer and seller
// @route   POST /api/chat/start
router.post("/start", protect, async (req, res) => {
  try {
    const { propertyId, sellerId, buyerId: providedBuyerId } = req.body;

    let buyerId, finalSellerId;

    if (req.user.role === "seller") {
      buyerId = providedBuyerId;
      finalSellerId = req.user._id;
    } else {
      buyerId = req.user._id;
      finalSellerId = sellerId;
    }

    if (!buyerId || !finalSellerId) {
      return res.status(400).json({ success: false, message: "Missing buyer or seller ID" });
    }

    // Check for existing chat
    let chat = await Chat.findOne({
      buyer: buyerId,
      seller: finalSellerId,
    });

    if (!chat) {
      chat = await Chat.create({
        property: propertyId || undefined,
        buyer: buyerId,
        seller: finalSellerId,
        messages: [],
      });
    }

    // Populate and return
    chat = await Chat.findById(chat._id)
      .populate("buyer", "name email profilePic")
      .populate("seller", "name email profilePic")
      .populate("property", "title price images city area");

    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating or getting chat",
      error: err.message,
    });
  }
});

// @desc    Get all conversations for the current user
// @route   GET /api/chat
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate("buyer", "name email profilePic")
      .populate("seller", "name email profilePic")
      .populate("property", "title price images")
      .populate("messages.sender", "name profilePic")
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: chats.length, chats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Get single conversation
// @route   GET /api/chat/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("buyer", "name email profilePic")
      .populate("seller", "name email profilePic")
      .populate("property", "title price images")
      .populate("messages.sender", "name profilePic");

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    const userId = req.user._id.toString();
    if (chat.buyer._id.toString() !== userId && chat.seller._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to view this chat" });
    }

    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Send a message in a conversation
// @route   POST /api/chat/:id/message
router.post("/:id/message", protect, upload.single("image"), async (req, res) => {
  try {
    const { text } = req.body;
    let imageUrl = "";

    if (req.file) {
      const uploadRes = await uploadToCloudinary(req.file.buffer, "chat");
      imageUrl = uploadRes.secure_url;
    }

    if (!text && !imageUrl) {
      return res.status(400).json({ success: false, message: "Message text or image is required" });
    }

    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    const userId = req.user._id.toString();
    if (chat.buyer.toString() !== userId && chat.seller.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to message here" });
    }

    const newMessage = {
      sender: req.user._id,
      text: text || "",
      image: imageUrl,
      createdAt: new Date(),
    };

    chat.messages.push(newMessage);
    await chat.save();

    const updatedChat = await Chat.findById(req.params.id)
      .populate("buyer", "name email profilePic")
      .populate("seller", "name email profilePic")
      .populate("property", "title price images")
      .populate("messages.sender", "name profilePic");

    res.status(201).json({ success: true, chat: updatedChat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Delete message from conversation
// @route   DELETE /api/chat/:chatId/message/:messageId
router.delete("/:chatId/message/:messageId", protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this message" });
    }

    message.deleteOne();
    await chat.save();

    res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
