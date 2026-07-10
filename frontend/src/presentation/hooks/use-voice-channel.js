import { useCallback, useEffect, useRef, useState } from "react";
import { ChimeMeetingManager } from "../../infrastructure/chime/ChimeMeetingManager.js";
import {
  buildVoiceMeetingIdUseCase,
  voiceMeetingRepository,
  voicePresenceRepository,
} from "../composition/container.js";

export function useVoiceChannel({ serverId, channelId, currentUser }) {
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const managerRef = useRef(null);
  const audioElementRef = useRef(null);
  const joinRequestRef = useRef(0);

  function resetVoiceState() {
    setParticipants([]);
    setIsMuted(false);
    setIsDeafened(false);
    setIsVideoEnabled(false);
  }

  function handleSessionEnded() {
    managerRef.current = null;
    setIsJoined(false);
    resetVoiceState();
  }

  useEffect(() => {
    const handlePageHide = () => {
      managerRef.current?.leave().catch(() => {});
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      managerRef.current?.leave().catch(() => {});
      managerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isJoined) return undefined;

    resetVoiceState();
    setError("");
  }, [channelId, isJoined]);

  useEffect(() => {
    if (!isJoined || !managerRef.current || !audioElementRef.current) return;

    managerRef.current.bindAudioElement(audioElementRef.current);
  }, [isJoined]);

  async function join() {
    if (!channelId || !currentUser?.id || isConnecting || isJoined) return;

    const joinRequestId = joinRequestRef.current + 1;
    joinRequestRef.current = joinRequestId;

    setIsConnecting(true);
    setError("");

    if (managerRef.current) {
      await managerRef.current.leave().catch(() => {});
      managerRef.current = null;
    }

    const manager = new ChimeMeetingManager({
      serverId,
      channelId,
      externalMeetingId: buildVoiceMeetingIdUseCase.execute({ serverId, channelId }),
      currentUser,
      voiceMeetingRepository,
      voicePresenceRepository,
      onParticipantsChange: setParticipants,
      onLocalStateChange: ({ isMuted: nextMuted, isDeafened: nextDeafened, isVideoEnabled: nextVideoEnabled }) => {
        setIsMuted(nextMuted);
        setIsDeafened(nextDeafened);
        setIsVideoEnabled(nextVideoEnabled);
      },
      onError: (message) => setError(message),
      onSessionEnded: handleSessionEnded,
    });

    managerRef.current = manager;

    try {
      await manager.join(audioElementRef.current);

      if (joinRequestRef.current !== joinRequestId) {
        await manager.leave().catch(() => {});
        return;
      }

      setIsJoined(true);
    } catch (currentError) {
      if (joinRequestRef.current === joinRequestId) {
        setError(currentError.message ?? "No se pudo unir al canal de voz.");
      }
    } finally {
      if (joinRequestRef.current === joinRequestId) {
        setIsConnecting(false);
      }
    }
  }

  async function leave() {
    joinRequestRef.current += 1;
    setIsConnecting(false);

    if (!managerRef.current) {
      setIsJoined(false);
      resetVoiceState();
      return;
    }

    await managerRef.current.leave().catch(() => {});
    managerRef.current = null;
    setIsJoined(false);
    resetVoiceState();
  }

  async function toggleMute() {
    if (!managerRef.current) return;
    await managerRef.current.toggleMute();
  }

  async function toggleDeafen() {
    if (!managerRef.current) return;
    await managerRef.current.toggleDeafen();
  }

  async function toggleVideo() {
    if (!managerRef.current) return;
    await managerRef.current.toggleVideo();
  }

  const registerVideoElement = useCallback((attendeeId, videoElement) => {
    managerRef.current?.registerVideoElement(attendeeId, videoElement);
  }, []);

  const unregisterVideoElement = useCallback((attendeeId) => {
    managerRef.current?.unregisterVideoElement(attendeeId);
  }, []);

  return {
    participants,
    error,
    isConnecting,
    isJoined,
    isMuted,
    isDeafened,
    isVideoEnabled,
    audioElementRef,
    join,
    leave,
    toggleMute,
    toggleDeafen,
    toggleVideo,
    registerVideoElement,
    unregisterVideoElement,
  };
}
