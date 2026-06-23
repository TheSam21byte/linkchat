import mongoose from "mongoose";

const directMessageSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

directMessageSchema.index({ fromUserId: 1, toUserId: 1, createdAt: -1 });
directMessageSchema.index({ toUserId: 1, fromUserId: 1, createdAt: -1 });

export default mongoose.model("DirectMessage", directMessageSchema);
