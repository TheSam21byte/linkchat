import { IChimeMeetingRepository } from "../../../../domain/ports/IChimeMeetingRepository.js";
import ChimeMeeting from "../models/ChimeMeeting.js";

export class MongooseChimeMeetingRepository extends IChimeMeetingRepository {
  async findByExternalMeetingId(externalMeetingId) {
    return ChimeMeeting.findOne({ externalMeetingId });
  }

  async upsert(externalMeetingId, { meetingId, meeting, mediaRegion }) {
    return ChimeMeeting.findOneAndUpdate(
      { externalMeetingId },
      {
        externalMeetingId,
        meetingId,
        meeting,
        mediaRegion,
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );
  }

  async deleteByExternalMeetingId(externalMeetingId) {
    return ChimeMeeting.deleteOne({ externalMeetingId });
  }
}
