import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true
    },
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      required: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Invitation", invitationSchema);