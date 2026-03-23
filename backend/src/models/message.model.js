import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver ID is required"],
      index: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    image: {
      type: String,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for efficient querying of conversations
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

// Validation: at least one of text or image must be present
messageSchema.pre("validate", function (next) {
  if (!this.text && !this.image) {
    next(new Error("Message must contain either text or image"));
  } else {
    next();
  }
});

const Message = mongoose.model("Message", messageSchema);

export default Message;