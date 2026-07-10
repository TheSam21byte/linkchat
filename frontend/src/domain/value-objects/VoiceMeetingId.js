export class VoiceMeetingId {
  static build(serverId, channelId) {
    return `linkchat-${String(serverId)}-${String(channelId)}`;
  }
}
