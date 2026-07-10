import {
  ChimeSDKMeetingsClient,
  CreateAttendeeCommand,
  CreateMeetingCommand,
} from "@aws-sdk/client-chime-sdk-meetings";
import { AppError } from "../../domain/errors/AppError.js";
import { IVoiceService } from "../../domain/ports/IVoiceService.js";
import { MongooseChimeMeetingRepository } from "../persistence/mongoose/repositories/MongooseChimeMeetingRepository.js";
import { LambdaVoiceAdapter } from "./LambdaVoiceAdapter.js";

const DEFAULT_REGION = process.env.AWS_REGION ?? "us-east-1";

function sanitizeExternalMeetingId(value) {
  return String(value).trim().slice(0, 64);
}

function sanitizeAttendeeName(value) {
  return String(value).trim().slice(0, 64);
}

function buildClientRequestToken(externalMeetingId, { unique = false } = {}) {
  const normalizedMeetingId = sanitizeExternalMeetingId(externalMeetingId);

  if (!unique) {
    return normalizedMeetingId;
  }

  const suffix = Date.now().toString(36);
  const maxPrefixLength = Math.max(1, 64 - suffix.length);

  return `${normalizedMeetingId.slice(0, maxPrefixLength)}${suffix}`.slice(0, 64);
}

function getChimeClient() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "Faltan AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY en backend/.env para crear reuniones de Chime."
    );
  }

  return new ChimeSDKMeetingsClient({
    region: DEFAULT_REGION,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function isStaleMeetingError(error) {
  return (
    error?.name === "NotFoundException" ||
    error?.name === "BadRequestException" ||
    /meeting.*not found/i.test(error?.message ?? "")
  );
}

export class ChimeVoiceService extends IVoiceService {
  constructor(
    lambdaVoiceAdapter = new LambdaVoiceAdapter(),
    chimeMeetingRepository = new MongooseChimeMeetingRepository()
  ) {
    super();
    this.lambdaVoiceAdapter = lambdaVoiceAdapter;
    this.chimeMeetingRepository = chimeMeetingRepository;
  }

  isConfigured() {
    return Boolean(
      process.env.AWS_ACCESS_KEY_ID?.trim() &&
        process.env.AWS_SECRET_ACCESS_KEY?.trim()
    );
  }

  isLambdaFallbackEnabled() {
    return this.lambdaVoiceAdapter.isEnabled();
  }

  async joinMeeting(input) {
    const payload = {
      externalMeetingId: input.externalMeetingId,
      title: input.externalMeetingId,
      meetingId: input.externalMeetingId,
      channelId: input.externalMeetingId,
      name: input.attendeeName,
      attendeeName: input.attendeeName,
      attendeeExternalId: input.attendeeExternalId,
      userName: input.attendeeName,
      region: input.region ?? "us-east-1",
    };

    if (this.isConfigured()) {
      return this.createVoiceSession({
        externalMeetingId: input.externalMeetingId,
        attendeeName: input.attendeeName,
        attendeeExternalId: input.attendeeExternalId,
      });
    }

    if (this.isLambdaFallbackEnabled()) {
      try {
        return await this.lambdaVoiceAdapter.joinMeeting(payload);
      } catch (error) {
        throw new AppError(error.message, error.statusCode ?? 502);
      }
    }

    throw new AppError(
      "Voz no configurada. Agrega AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY en backend/.env, o corrige tu Lambda de Chime.",
      503
    );
  }

  async createVoiceSession({ externalMeetingId, attendeeName, attendeeExternalId }) {
    const client = getChimeClient();
    const normalizedAttendeeName = sanitizeAttendeeName(attendeeName);
    const uniqueExternalUserId = sanitizeAttendeeName(
      attendeeExternalId ?? `${normalizedAttendeeName}-${Date.now()}`
    );

    let meeting = await this.getOrCreateMeeting(client, externalMeetingId);

    try {
      const attendee = await this.createAttendee(client, meeting, uniqueExternalUserId);

      return {
        Meeting: meeting,
        Attendee: attendee,
      };
    } catch (error) {
      if (!isStaleMeetingError(error)) {
        throw error;
      }

      meeting = await this.getOrCreateMeeting(client, externalMeetingId, {
        forceRefresh: true,
      });

      const attendee = await this.createAttendee(client, meeting, uniqueExternalUserId);

      return {
        Meeting: meeting,
        Attendee: attendee,
      };
    }
  }

  async createAttendee(client, meeting, attendeeExternalId) {
    const uniqueExternalUserId = sanitizeAttendeeName(attendeeExternalId);

    const attendeeResponse = await client.send(
      new CreateAttendeeCommand({
        MeetingId: meeting.MeetingId,
        ExternalUserId: uniqueExternalUserId,
      })
    );

    return attendeeResponse.Attendee;
  }

  async createMeetingOnAws(client, externalMeetingId, { uniqueToken = false } = {}) {
    const normalizedMeetingId = sanitizeExternalMeetingId(externalMeetingId);

    const createMeetingResponse = await client.send(
      new CreateMeetingCommand({
        ClientRequestToken: buildClientRequestToken(normalizedMeetingId, {
          unique: uniqueToken,
        }),
        ExternalMeetingId: normalizedMeetingId,
        MediaRegion: DEFAULT_REGION,
      })
    );

    return createMeetingResponse.Meeting;
  }

  async persistMeeting(externalMeetingId, meeting) {
    const normalizedMeetingId = sanitizeExternalMeetingId(externalMeetingId);

    await this.chimeMeetingRepository.upsert(normalizedMeetingId, {
      meetingId: meeting.MeetingId,
      meeting,
      mediaRegion: DEFAULT_REGION,
    });

    return meeting;
  }

  async getOrCreateMeeting(client, externalMeetingId, { forceRefresh = false } = {}) {
    const normalizedMeetingId = sanitizeExternalMeetingId(externalMeetingId);

    if (!forceRefresh) {
      const existingRecord =
        await this.chimeMeetingRepository.findByExternalMeetingId(normalizedMeetingId);

      if (existingRecord?.meeting) {
        return existingRecord.meeting;
      }
    } else {
      await this.chimeMeetingRepository.deleteByExternalMeetingId(normalizedMeetingId);
    }

    try {
      const meeting = await this.createMeetingOnAws(client, normalizedMeetingId, {
        uniqueToken: forceRefresh,
      });
      await this.persistMeeting(normalizedMeetingId, meeting);
      return meeting;
    } catch (error) {
      if (error.name === "ConflictException") {
        const conflictRecord =
          await this.chimeMeetingRepository.findByExternalMeetingId(normalizedMeetingId);

        if (conflictRecord?.meeting) {
          return conflictRecord.meeting;
        }
      }

      throw error;
    }
  }
}
