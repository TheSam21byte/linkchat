import { AppError, ValidationError } from "../../../domain/errors/AppError.js";

export class JoinChimeMeetingUseCase {
  constructor(voiceService) {
    this.voiceService = voiceService;
  }

  async execute(input) {
    const meetingId =
      input.externalMeetingId ?? input.title ?? input.meetingId ?? input.channelId;
    const participantName = input.attendeeName ?? input.name ?? input.userName;
    const attendeeExternalId = input.attendeeExternalId ?? input.externalUserId;

    if (!meetingId?.trim()) {
      throw new ValidationError("externalMeetingId es requerido.");
    }

    if (!participantName?.trim()) {
      throw new ValidationError("attendeeName es requerido.");
    }

    return this.voiceService.joinMeeting({
      externalMeetingId: meetingId.trim(),
      attendeeName: participantName.trim(),
      attendeeExternalId: attendeeExternalId?.trim(),
      region: input.region ?? "us-east-1",
    });
  }
}
