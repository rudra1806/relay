import mongoose from "mongoose";

const contactRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate requests
contactRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

// Index for efficient queries
contactRequestSchema.index({ receiverId: 1, status: 1 });

const ContactRequest = mongoose.model("ContactRequest", contactRequestSchema);

export default ContactRequest;
