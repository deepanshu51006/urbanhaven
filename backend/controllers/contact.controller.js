import Contact from "../models/contact.model.js";
import { sendEmail } from "../utils/sendEmail.js";

// @desc    Submit public contact form
// @route   POST /api/contact
export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, role, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (name, email, message)",
      });
    }

    const contact = await Contact.create({
      name,
      email,
      phone: phone || "",
      role: role || "buyer",
      message,
    });

    // Notify Admin via Email
    const adminEmail = process.env.EMAIL_USER || "admin@realestateplatform.com";
    const adminMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #0d9488;">New Contact Request</h2>
        <p>You have received a new contact message from the platform:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "N/A"}</p>
          <p><strong>Role:</strong> ${role || "buyer"}</p>
          <p style="margin-top: 15px;"><strong>Message:</strong></p>
          <p style="font-style: italic; color: #475569;">"${message}"</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: adminEmail,
        subject: `New Contact Request from ${name}`,
        message: adminMessage,
      });
    } catch (emailErr) {
      console.warn("Contact email dispatch failed:", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully. We will get back to you shortly.",
      contact,
    });
  } catch (err) {
    console.error("Contact Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to submit message",
    });
  }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete contact message (Admin)
// @route   DELETE /api/contact/:id
export const deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Contact record deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
