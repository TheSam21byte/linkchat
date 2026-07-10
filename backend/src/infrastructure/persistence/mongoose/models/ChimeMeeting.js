import mongoose from "mongoose";

const chimeMeetingSchema = new mongoose.Schema(
  {
    externalMeetingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    meetingId: {
      type: String,
      required: true,
      trim: true,
    },
    meeting: {
      type: Object,
      required: true,
    },
    mediaRegion: {
      type: String,
      default: "us-east-1",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ChimeMeeting", chimeMeetingSchema);
