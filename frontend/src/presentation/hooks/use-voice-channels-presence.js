import { useEffect, useMemo, useState } from "react";
import { voicePresenceRepository } from "../composition/container.js";

function sortParticipants(participants = []) {
  return [...participants].sort((left, right) => {
    const leftTime = left.joinedAt?.toMillis?.() ?? left.joinedAt?.seconds ?? 0;
    const rightTime = right.joinedAt?.toMillis?.() ?? right.joinedAt?.seconds ?? 0;

    if (leftTime !== rightTime) return leftTime - rightTime;

    return String(left.username ?? left.userId).localeCompare(
      String(right.username ?? right.userId)
    );
  });
}

export function useVoiceChannelsPresence(serverId, channelIds = [], enabled = true) {
  const [presenceByChannel, setPresenceByChannel] = useState({});
  const channelKey = useMemo(() => channelIds.join("|"), [channelIds]);

  useEffect(() => {
    if (!enabled || !serverId || channelIds.length === 0) {
      setPresenceByChannel({});
      return undefined;
    }

    const unsubscribers = channelIds.map((channelId) =>
      voicePresenceRepository.subscribeVoiceParticipants(
        { serverId, channelId },
        (participants) => {
          setPresenceByChannel((current) => ({
            ...current,
            [channelId]: sortParticipants(participants),
          }));
        },
        () => {}
      )
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe?.());
    };
  }, [serverId, channelKey, enabled, channelIds]);

  return presenceByChannel;
}
