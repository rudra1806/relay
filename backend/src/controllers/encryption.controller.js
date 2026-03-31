import User from "../models/user.model.js";
import mongoose from "mongoose";

//===============================================================
// Encryption Controller
//===============================================================
// Zero-knowledge key management endpoints.
// The server stores/retrieves opaque encrypted blobs — it never
// sees plaintext private keys or message content.
//===============================================================

/**
 * GET /api/encryption/public-key/:userId
 * Fetch a user's public key for encrypting messages to them.
 */
export const getPublicKey = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(userId).select("publicKey");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.publicKey) {
      return res.status(404).json({ message: "User has not set up encryption" });
    }

    res.status(200).json({ publicKey: user.publicKey });
  } catch (error) {
    console.error("Error in getPublicKey:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /api/encryption/keys
 * Update the encrypted private key material.
 * Used after password change or recovery phrase restore.
 */
export const updateEncryptedKeys = async (req, res) => {
  try {
    const userId = req.user._id;
    const { encryptedPrivateKey, keyIv, keySalt, publicKey } = req.body;

    // Validate required fields
    if (!encryptedPrivateKey || !keyIv || !keySalt) {
      return res.status(400).json({
        message: "encryptedPrivateKey, keyIv, and keySalt are required",
      });
    }

    // Validate key material lengths (prevent oversized payloads)
    if (typeof encryptedPrivateKey !== "string" || encryptedPrivateKey.length > 200) {
      return res.status(400).json({ message: "Invalid encryptedPrivateKey format" });
    }
    if (typeof keyIv !== "string" || keyIv.length > 50) {
      return res.status(400).json({ message: "Invalid keyIv format" });
    }
    if (typeof keySalt !== "string" || keySalt.length > 50) {
      return res.status(400).json({ message: "Invalid keySalt format" });
    }
    if (publicKey && (typeof publicKey !== "string" || publicKey.length > 100)) {
      return res.status(400).json({ message: "Invalid publicKey format" });
    }

    const updateData = {
      encryptedPrivateKey,
      keyIv,
      keySalt,
    };

    // If publicKey is provided (recovery with new keys), update it too
    if (publicKey) {
      updateData.publicKey = publicKey;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Encryption keys updated successfully",
      publicKey: user.publicKey,
    });
  } catch (error) {
    console.error("Error in updateEncryptedKeys:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
