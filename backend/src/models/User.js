import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3
    },
    username: {
      type: String,
      required: true,
      trim: true
    },
    avatarUrl: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ["online", "offline", "busy"],
      default: "offline"
    },
    lastSeen: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("User", userSchema);