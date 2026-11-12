import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Uploads a file buffer directly to the local server's uploads folder.
 * Zero external cloud configuration (Cloudinary, AWS, etc.) required.
 *
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {String} folder - Subdirectory inside uploads (e.g. "properties", "avatars", "chat")
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export const uploadToLocalStorage = async (buffer, folder = "properties") => {
  const targetDir = path.resolve("uploads", folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const fileId = crypto.randomBytes(12).toString("hex");
  const fileName = `${Date.now()}-${fileId}.jpg`;
  const filePath = path.join(targetDir, fileName);

  await fs.promises.writeFile(filePath, buffer);

  const serverUrl =
    process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
  const relativePath = `uploads/${folder}/${fileName}`;

  return {
    secure_url: `${serverUrl}/${relativePath}`,
    public_id: `${folder}/${fileName}`,
  };
};

// Aliased export to preserve complete backward compatibility across existing controllers
export const uploadToCloudinary = uploadToLocalStorage;
export default uploadToLocalStorage;
