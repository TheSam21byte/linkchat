import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    username: {
      type: String,
      required: true,
      trim: true
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true
    },
    content: {
      type: String,
      required: true
    },
    avatarUrl: {
      type: String,
      default: null
    },
    type: {
      type: String,
      enum: ["public", "private", "system"],
      default: "public"
    }
  },
  {
    timestamps: true
  }
);

messageSchema.index({ channelId: 1, createdAt: -1 });
messageSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);