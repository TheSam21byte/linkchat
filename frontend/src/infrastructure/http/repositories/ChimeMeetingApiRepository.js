import { IVoiceMeetingRepository } from "../../../domain/ports/IVoiceMeetingRepository.js";

export class ChimeMeetingApiRepository extends IVoiceMeetingRepository {
  constructor(httpClient) {
    super();
    this.httpClient = httpClient;
  }

  async joinMeeting({ externalMeetingId, attendeeName, attendeeExternalId }) {
    const payload = {
      externalMeetingId,
      title: externalMeetingId,
      meetingId: externalMeetingId,
      channelId: externalMeetingId,
      name: attendeeName,
      attendeeName,
      attendeeExternalId:
        attendeeExternalId ??
        `linkchat-${externalMeetingId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      userName: attendeeName,
      region: "us-east-1",
    };

    const data = await this.httpClient.request("/api/voice/chime/join", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const meeting = data?.Meeting ?? data?.meeting;
    const attendee = data?.Attendee ?? data?.attendee;

    if (!meeting || !attendee) {
      throw new Error("El backend no devolvió Meeting y Attendee válidos para Chime.");
    }

    return { meeting, attendee };
  }
}
