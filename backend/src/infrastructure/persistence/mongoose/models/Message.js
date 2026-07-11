import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
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

export default mongoose.model("Message", messageSchema);