/**
 * Lambda de referencia para desplegar en AWS.
 * Corrige el error: externalMeetingId null por no parsear event.body.
 */
import {
  ChimeSDKMeetingsClient,
  CreateAttendeeCommand,
  CreateMeetingCommand,
} from "@aws-sdk/client-chime-sdk-meetings";

const REGION = process.env.AWS_REGION ?? "us-east-1";
const client = new ChimeSDKMeetingsClient({ region: REGION });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}

export const handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS" || event.httpMethod === "OPTIONS") {
    return jsonResponse(200, { ok: true });
  }

  try {
    const body =
      typeof event.body === "string"
        ? JSON.parse(event.body || "{}")
        : event.body ?? {};

    const query = event.queryStringParameters ?? {};
    const externalMeetingId = String(
      body.externalMeetingId ??
        body.title ??
        body.meetingId ??
        query.externalMeetingId ??
        query.title ??
        ""
    ).trim();

    const attendeeName = String(
      body.name ?? body.attendeeName ?? body.userName ?? query.name ?? "guest"
    ).trim();

    if (!externalMeetingId) {
      return jsonResponse(400, {
        error: "externalMeetingId es requerido.",
      });
    }

    const meetingResponse = await client.send(
      new CreateMeetingCommand({
        ClientRequestToken: externalMeetingId.slice(0, 64),
        ExternalMeetingId: externalMeetingId.slice(0, 64),
        MediaRegion: body.region ?? REGION,
      })
    );

    const attendeeResponse = await client.send(
      new CreateAttendeeCommand({
        MeetingId: meetingResponse.Meeting.MeetingId,
        ExternalUserId: attendeeName.slice(0, 64),
      })
    );

    return jsonResponse(200, {
      Meeting: meetingResponse.Meeting,
      Attendee: attendeeResponse.Attendee,
    });
  } catch (error) {
    return jsonResponse(500, {
      error: error.message ?? "Error al crear la reunión de voz.",
    });
  }
};
