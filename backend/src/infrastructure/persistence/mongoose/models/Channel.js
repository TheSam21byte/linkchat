import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      required: true
    }
  },
  {
    timestamps: true
  }
);

channelSchema.index({ serverId: 1, name: 1 }, { unique: true });

export default mongoose.model("Channel", channelSchema);