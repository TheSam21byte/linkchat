import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      default: null
    },
    passwordHash: {
      type: String,
      required: function requiredPasswordHash() {
        return this.isNew;
      },
      select: false,
      default: null
    },
    name: {
      type: String,
      trim: true,
      minlength: 3,
      default: null
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3
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