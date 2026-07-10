import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
  MeetingSessionStatusCode,
} from "amazon-chime-sdk-js";
import { ChimeMeetingApiRepository } from "../http/repositories/ChimeMeetingApiRepository.js";
import { FirebaseVoicePresenceRepository } from "../firebase/FirebaseVoicePresenceRepository.js";
import { HttpClient } from "../http/HttpClient.js";
import { LocalAuthTokenStorage } from "../storage/LocalAuthTokenStorage.js";

function createDefaultVoiceRepositories() {
  const tokenStorage = new LocalAuthTokenStorage();
  const httpClient = new HttpClient(tokenStorage);

  return {
    voiceMeetingRepository: new ChimeMeetingApiRepository(httpClient),
    voicePresenceRepository: new FirebaseVoicePresenceRepository(),
  };
}

export class ChimeMeetingManager {
  constructor({
    serverId,
    channelId,
    externalMeetingId,
    currentUser,
    onParticipantsChange,
    onLocalStateChange,
    onError,
    onSessionEnded,
    voiceMeetingRepository,
    voicePresenceRepository,
  }) {
    const defaultRepos = createDefaultVoiceRepositories();
    this.voiceMeetingRepository =
      voiceMeetingRepository ?? defaultRepos.voiceMeetingRepository;
    this.voicePresenceRepository =
      voicePresenceRepository ?? defaultRepos.voicePresenceRepository;

    this.serverId = serverId
    this.channelId = channelId
    this.externalMeetingId = externalMeetingId
    this.currentUser = currentUser
    this.onParticipantsChange = onParticipantsChange
    this.onLocalStateChange = onLocalStateChange
    this.onError = onError
    this.onSessionEnded = onSessionEnded

    this.logger = new ConsoleLogger('LinkChatChime', LogLevel.WARN)
    this.deviceController = new DefaultDeviceController(this.logger)
    this.meetingSession = null
    this.audioVideo = null
    this.audioElement = null
    this.participants = new Map()
    this.isMuted = false
    this.isDeafened = false
    this.isVideoEnabled = false
    this.isActive = false
    this.isConnected = false
    this.observer = null
    this.videoElements = new Map()
    this.leavingPromise = null
    this.firestoreUnsubscriber = null
    this.firestoreParticipantsByAttendeeId = new Map()
    this.firestoreParticipantsByUserId = new Map()
  }

  getLocalAttendeeId() {
    return this.meetingSession?.configuration?.credentials?.attendeeId ?? null
  }

  normalizeAttendeeId(attendeeId) {
    return attendeeId == null ? null : String(attendeeId)
  }

  resolveVideoState(patch = {}, firestoreProfile = null) {
    const hasLiveTile = patch.tileId != null
    const firestoreOn = Boolean(firestoreProfile?.isVideoEnabled)

    if (hasLiveTile) {
      return {
        isVideoEnabled: true,
        tileId: patch.tileId,
      }
    }

    if (patch.chimeVideoOff) {
      return {
        isVideoEnabled: false,
        tileId: null,
      }
    }

    if (firestoreOn || patch.isVideoEnabled === true) {
      return {
        isVideoEnabled: true,
        tileId: patch.tileId ?? null,
      }
    }

    return {
      isVideoEnabled: false,
      tileId: null,
    }
  }

  enrichParticipantProfile(attendeeId, patch = {}) {
    const normalizedAttendeeId = this.normalizeAttendeeId(attendeeId)
    const firestoreProfile =
      this.firestoreParticipantsByAttendeeId.get(normalizedAttendeeId) ??
      this.firestoreParticipantsByUserId.get(String(patch.userId ?? ''))

    const videoState = this.resolveVideoState(patch, firestoreProfile)

    return {
      attendeeId: normalizedAttendeeId,
      userId: firestoreProfile?.userId ?? patch.userId ?? normalizedAttendeeId,
      username:
        firestoreProfile?.username ?? patch.username ?? normalizedAttendeeId.slice(0, 8),
      name:
        firestoreProfile?.name ??
        firestoreProfile?.username ??
        patch.name ??
        `Usuario ${String(normalizedAttendeeId).slice(0, 6)}`,
      avatarUrl: firestoreProfile?.avatarUrl ?? patch.avatarUrl ?? null,
      isMuted: patch.isMuted ?? firestoreProfile?.isMuted ?? false,
      isDeafened: patch.isDeafened ?? firestoreProfile?.isDeafened ?? false,
      isVideoEnabled: videoState.isVideoEnabled,
      tileId: videoState.tileId,
      chimeVideoOff: Boolean(patch.chimeVideoOff),
      isLocal:
        patch.isLocal ??
        String(normalizedAttendeeId) === String(this.getLocalAttendeeId()),
      isScreenSharing: patch.isScreenSharing ?? false,
    }
  }

  mergeParticipantsWithFirestore() {
    this.participants.forEach((participant, attendeeId) => {
      const normalizedAttendeeId = this.normalizeAttendeeId(attendeeId)
      const firestoreProfile =
        this.firestoreParticipantsByAttendeeId.get(normalizedAttendeeId) ??
        this.firestoreParticipantsByUserId.get(String(participant.userId))

      const patch = { ...participant }

      if (participant.tileId != null || firestoreProfile?.isVideoEnabled) {
        patch.chimeVideoOff = false
      }

      this.participants.set(
        normalizedAttendeeId,
        this.enrichParticipantProfile(normalizedAttendeeId, patch),
      )
    })

    this.participants.forEach((participant, attendeeId) => {
      if (participant.isVideoEnabled && participant.tileId == null && !participant.isLocal) {
        this.syncVideoTilesForAttendee(attendeeId)
        this.queueRemoteVideoSync(attendeeId)
      }
    })

    this.emitParticipants()
  }

  subscribeFirestoreRoster() {
    this.firestoreUnsubscriber?.()
    this.firestoreParticipantsByAttendeeId.clear()
    this.firestoreParticipantsByUserId.clear()

    this.firestoreUnsubscriber = this.voicePresenceRepository.subscribeVoiceParticipants(
      { serverId: this.serverId, channelId: this.channelId },
      (participants) => {
        this.firestoreParticipantsByAttendeeId.clear()
        this.firestoreParticipantsByUserId.clear()

        participants.forEach((participant) => {
          this.firestoreParticipantsByUserId.set(String(participant.userId), participant)

          if (participant.chimeAttendeeId) {
            this.firestoreParticipantsByAttendeeId.set(
              String(participant.chimeAttendeeId),
              participant,
            )
          }
        })

        this.mergeParticipantsWithFirestore()
      },
      () => {},
    )
  }

  ensureConnected() {
    if (!this.audioVideo || !this.isActive || !this.isConnected) {
      throw new Error('La sesión de voz se desconectó. Sal y vuelve a entrar al canal.')
    }
  }

  handleSessionStopped(sessionStatus) {
    this.isConnected = false
    this.isActive = false

    const statusCode = sessionStatus.statusCode()

    if (statusCode === MeetingSessionStatusCode.AudioJoinedFromAnotherDevice) {
      this.onError?.(
        'Detectamos otra conexión de voz con tu usuario. Sal del canal y vuelve a entrar.',
      )
    } else if (statusCode === MeetingSessionStatusCode.MeetingEnded) {
      this.onError?.('La reunión de voz terminó.')
    }

    this.onSessionEnded?.(sessionStatus)
  }

  getAttendeeLabel(attendeeId) {
    const participant = this.participants.get(attendeeId)

    if (participant?.username) return participant.username
    if (participant?.name) return participant.name

    return attendeeId.slice(0, 8)
  }

  emitParticipants() {
    const nextParticipants = [...this.participants.values()].sort((left, right) =>
      String(left.username ?? left.name ?? left.attendeeId).localeCompare(
        String(right.username ?? right.name ?? right.attendeeId),
      ),
    )

    this.onParticipantsChange?.(nextParticipants)
  }

  upsertParticipant(attendeeId, patch = {}) {
    const normalizedAttendeeId = this.normalizeAttendeeId(attendeeId)

    if (!normalizedAttendeeId) return

    const currentParticipant = this.participants.get(normalizedAttendeeId) ?? {}

    this.participants.set(
      normalizedAttendeeId,
      this.enrichParticipantProfile(normalizedAttendeeId, {
        ...currentParticipant,
        ...patch,
      }),
    )

    this.emitParticipants()
  }

  removeParticipant(attendeeId) {
    const normalizedAttendeeId = this.normalizeAttendeeId(attendeeId)

    if (!normalizedAttendeeId || !this.participants.has(normalizedAttendeeId)) return

    this.participants.delete(normalizedAttendeeId)
    this.emitParticipants()
  }

  syncLocalParticipantToFirestore() {
    this.voicePresenceRepository
      .updateParticipant({
        serverId: this.serverId,
        channelId: this.channelId,
        userId: this.currentUser.id,
        data: {
          chimeAttendeeId: this.getLocalAttendeeId(),
          isMuted: this.isMuted,
          isDeafened: this.isDeafened,
          isVideoEnabled: this.isVideoEnabled,
        },
      })
      .catch(() => {})
  }

  handleVideoTileState(tileState) {
    const boundAttendeeId = this.normalizeAttendeeId(tileState.boundAttendeeId)

    if (!boundAttendeeId || tileState.isContent || tileState.tileId == null) {
      return
    }

    this.upsertParticipant(boundAttendeeId, {
      tileId: tileState.tileId,
      isVideoEnabled: true,
      isLocal: tileState.localTile,
      chimeVideoOff: false,
    })

    this.scheduleVideoBind(boundAttendeeId, tileState.tileId)
  }

  syncAllVideoTiles() {
    if (!this.audioVideo) return

    try {
      const remoteTiles = this.audioVideo.getAllRemoteVideoTiles?.() ?? []

      remoteTiles.forEach((tile) => {
        this.handleVideoTileState(tile.state())
      })

      const localTile = this.audioVideo.getLocalVideoTile?.()

      if (localTile) {
        this.handleVideoTileState(localTile.state())
      }
    } catch {
      // Ignorar si la sesión aún no expone tiles.
    }
  }

  syncVideoTilesForAttendee(attendeeId) {
    if (!this.audioVideo) return

    const normalizedAttendeeId = this.normalizeAttendeeId(attendeeId)

    if (!normalizedAttendeeId) return

    try {
      const remoteTiles = this.audioVideo.getAllRemoteVideoTiles?.() ?? []

      remoteTiles.forEach((tile) => {
        const tileState = tile.state()

        if (this.normalizeAttendeeId(tileState.boundAttendeeId) === normalizedAttendeeId) {
          this.handleVideoTileState(tileState)
        }
      })
    } catch {
      // Ignorar errores de sincronización puntual.
    }
  }

  queueRemoteVideoSync(attendeeId) {
    const normalizedAttendeeId = this.normalizeAttendeeId(attendeeId)

    if (!normalizedAttendeeId) return

    ;[250, 750, 1500, 3000, 5000].forEach((delayMs) => {
      window.setTimeout(() => {
        if (!this.isActive) return

        this.syncVideoTilesForAttendee(normalizedAttendeeId)
      }, delayMs)
    })
  }

  bindAudioElement(audioElement) {
    this.audioElement = audioElement
    this.audioVideo?.bindAudioElement(audioElement)
  }

  async configureAudioDevices() {
    const audioInputs = await this.audioVideo.listAudioInputDevices()
    const audioOutputs = await this.audioVideo.listAudioOutputDevices()

    if (audioInputs[0]?.deviceId) {
      await this.audioVideo.startAudioInput(audioInputs[0].deviceId)
    }

    if (audioOutputs[0]?.deviceId) {
      await this.audioVideo.chooseAudioOutput(audioOutputs[0].deviceId)
    }
  }

  createObserver() {
    return {
      audioVideoDidStart: () => {
        this.isConnected = true
        this.syncAllVideoTiles()
      },
      audioVideoDidStop: (sessionStatus) => {
        this.handleSessionStopped(sessionStatus)
      },
      videoTileDidUpdate: (tileState) => {
        this.handleVideoTileState(tileState)
        this.onVideoTileUpdated?.(tileState)
      },
      videoTileWasRemoved: (tileId) => {
        this.participants.forEach((participant, attendeeId) => {
          if (participant.tileId === tileId) {
            const normalizedAttendeeId = this.normalizeAttendeeId(attendeeId)
            const videoElement = this.videoElements.get(normalizedAttendeeId)

            if (videoElement) {
              videoElement.srcObject = null
            }

            this.upsertParticipant(attendeeId, {
              tileId: null,
              isVideoEnabled: false,
              chimeVideoOff: true,
            })
          }
        })

        this.onVideoTileRemoved?.(tileId)
      },
    }
  }

  subscribeToPresence() {
    const localAttendeeId = this.getLocalAttendeeId()

    this.audioVideo.realtimeSubscribeToAttendeeIdPresence((attendeeId, present) => {
      if (present) {
        if (String(attendeeId) !== String(localAttendeeId)) {
          this.upsertParticipant(attendeeId, {
            isLocal: false,
          })
        }

        this.audioVideo.realtimeSubscribeToVolumeIndicator(
          attendeeId,
          (updatedAttendeeId, volume, muted) => {
            if (String(updatedAttendeeId) === String(localAttendeeId)) {
              return
            }

            this.upsertParticipant(updatedAttendeeId, {
              isMuted: Boolean(muted),
            })
          },
        )

        return
      }

      if (String(attendeeId) !== String(localAttendeeId)) {
        this.removeParticipant(attendeeId)
      }
    })
  }

  async join(audioElement) {
    if (this.leavingPromise) {
      await this.leavingPromise
    }

    if (this.isActive) {
      await this.leave()
    }

    this.isActive = true
    this.isConnected = false

    const attendeeName =
      this.currentUser.name ?? this.currentUser.username ?? `user-${this.currentUser.id}`

    const attendeeExternalId = `linkchat-u${this.currentUser.id}-s${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    const { meeting, attendee } = await this.voiceMeetingRepository.joinMeeting({
      externalMeetingId: this.externalMeetingId,
      attendeeName,
      attendeeExternalId,
    })

    const meetingSessionConfiguration = new MeetingSessionConfiguration(meeting, attendee)

    this.meetingSession = new DefaultMeetingSession(
      meetingSessionConfiguration,
      this.logger,
      this.deviceController,
    )

    this.audioVideo = this.meetingSession.audioVideo
    this.observer = this.createObserver()
    this.audioVideo.addObserver(this.observer)

    await this.voicePresenceRepository
      .joinParticipant({
        serverId: this.serverId,
        channelId: this.channelId,
        user: this.currentUser,
      })
      .catch(() => {})

    this.subscribeFirestoreRoster()

    await this.configureAudioDevices()

    if (audioElement) {
      this.bindAudioElement(audioElement)
    }

    this.subscribeToPresence()

    const localAttendeeId = this.getLocalAttendeeId()

    this.upsertParticipant(localAttendeeId, {
      userId: String(this.currentUser.id),
      username: this.currentUser.username,
      name: attendeeName,
      avatarUrl: this.currentUser.avatarUrl ?? null,
      isLocal: true,
      isMuted: this.isMuted,
      isDeafened: this.isDeafened,
      isVideoEnabled: this.isVideoEnabled,
    })

    await this.voicePresenceRepository
      .updateParticipant({
        serverId: this.serverId,
        channelId: this.channelId,
        userId: this.currentUser.id,
        data: {
          chimeAttendeeId: localAttendeeId,
          isMuted: this.isMuted,
          isDeafened: this.isDeafened,
          isVideoEnabled: this.isVideoEnabled,
        },
      })
      .catch(() => {})

    this.audioVideo.start()

    window.setTimeout(() => {
      this.syncAllVideoTiles()
    }, 500)
  }

  async leave() {
    if (this.leavingPromise) {
      return this.leavingPromise
    }

    this.leavingPromise = this.performLeave()

    try {
      await this.leavingPromise
    } finally {
      this.leavingPromise = null
    }
  }

  async performLeave() {
    this.isActive = false
    this.isConnected = false

    if (this.audioVideo) {
      try {
        await this.stopLocalCamera()

        await this.audioVideo.stopAudioInput().catch(() => {})

        if (this.observer) {
          this.audioVideo.removeObserver(this.observer)
        }

        this.audioVideo.stop()
      } catch {
        // Ignorar errores al cerrar una sesión ya caída.
      }
    }

    this.meetingSession = null
    this.audioVideo = null
    this.observer = null
    this.isVideoEnabled = false
    this.isMuted = false
    this.isDeafened = false
    this.firestoreUnsubscriber?.()
    this.firestoreUnsubscriber = null
    this.firestoreParticipantsByAttendeeId.clear()
    this.firestoreParticipantsByUserId.clear()
    this.videoElements.clear()
    this.participants.clear()
    this.emitParticipants()

    await this.voicePresenceRepository
      .leaveParticipant({
        serverId: this.serverId,
        channelId: this.channelId,
        userId: this.currentUser.id,
      })
      .catch(() => {})
  }

  async stopLocalCamera(localAttendeeId = this.getLocalAttendeeId()) {
    if (!this.audioVideo) return

    const participant = localAttendeeId ? this.participants.get(localAttendeeId) : null
    const tileId = participant?.tileId

    try {
      this.audioVideo.stopLocalVideoTile()
    } catch {
      // La sesión pudo cerrar el tile antes.
    }

    if (tileId != null) {
      try {
        this.audioVideo.unbindVideoElement(tileId)
      } catch {
        // Ignorar si el tile ya no existe.
      }
    }

    if (localAttendeeId) {
      const normalizedAttendeeId = this.normalizeAttendeeId(localAttendeeId)
      const videoElement = this.videoElements.get(normalizedAttendeeId)

      if (videoElement) {
        videoElement.srcObject = null
      }
    }

    try {
      await this.audioVideo.stopVideoInput()
    } catch {
      // Ignorar si la cámara ya estaba liberada.
    }

    this.isVideoEnabled = false

    if (localAttendeeId) {
      this.upsertParticipant(localAttendeeId, {
        isVideoEnabled: false,
        tileId: null,
        chimeVideoOff: true,
      })
    }
  }

  async startLocalCamera(localAttendeeId = this.getLocalAttendeeId()) {
    if (!this.audioVideo) {
      throw new Error('La sesión de voz no está activa.')
    }

    await this.stopLocalCamera(localAttendeeId)

    const videoInputs = await this.audioVideo.listVideoInputDevices()

    if (!videoInputs[0]?.deviceId) {
      throw new Error('No se detectó ninguna cámara.')
    }

    await this.audioVideo.startVideoInput(videoInputs[0].deviceId)
    const tileId = this.audioVideo.startLocalVideoTile()
    this.isVideoEnabled = true

    if (localAttendeeId) {
      this.upsertParticipant(localAttendeeId, {
        isVideoEnabled: true,
        tileId,
        isLocal: true,
        chimeVideoOff: false,
      })

      this.scheduleVideoBind(localAttendeeId, tileId)
    }

    window.setTimeout(() => {
      this.syncAllVideoTiles()
    }, 300)

    return tileId
  }

  async toggleMute() {
    this.ensureConnected()

    this.isMuted = !this.isMuted

    if (this.isMuted) {
      this.audioVideo.realtimeMuteLocalAudio()
    } else {
      this.audioVideo.realtimeUnmuteLocalAudio()
      if (this.isDeafened) {
        this.isDeafened = false
        if (this.audioElement) {
          this.audioElement.muted = false
        }
      }
    }

    const localAttendeeId = this.meetingSession?.configuration?.credentials?.attendeeId

    if (localAttendeeId) {
      this.upsertParticipant(localAttendeeId, {
        isMuted: this.isMuted,
        isDeafened: this.isDeafened,
      })
    }

    this.onLocalStateChange?.({
      isMuted: this.isMuted,
      isDeafened: this.isDeafened,
      isVideoEnabled: this.isVideoEnabled,
    })

    this.syncLocalParticipantToFirestore()
  }

  async toggleDeafen() {
    this.ensureConnected()

    this.isDeafened = !this.isDeafened

    if (this.isDeafened) {
      this.isMuted = true
      this.audioVideo.realtimeMuteLocalAudio()

      if (this.audioElement) {
        this.audioElement.muted = true
      }
    } else {
      if (this.audioElement) {
        this.audioElement.muted = false
      }
    }

    const localAttendeeId = this.meetingSession?.configuration?.credentials?.attendeeId

    if (localAttendeeId) {
      this.upsertParticipant(localAttendeeId, {
        isMuted: this.isMuted,
        isDeafened: this.isDeafened,
      })
    }

    this.onLocalStateChange?.({
      isMuted: this.isMuted,
      isDeafened: this.isDeafened,
      isVideoEnabled: this.isVideoEnabled,
    })

    this.syncLocalParticipantToFirestore()
  }

  async toggleVideo() {
    this.ensureConnected()

    const localAttendeeId = this.getLocalAttendeeId()

    try {
      if (this.isVideoEnabled) {
        await this.stopLocalCamera(localAttendeeId)
      } else {
        await this.startLocalCamera(localAttendeeId)
      }

      this.onLocalStateChange?.({
        isMuted: this.isMuted,
        isDeafened: this.isDeafened,
        isVideoEnabled: this.isVideoEnabled,
      })

      this.syncLocalParticipantToFirestore()
    } catch (videoError) {
      await this.stopLocalCamera(localAttendeeId).catch(() => {})

      this.onLocalStateChange?.({
        isMuted: this.isMuted,
        isDeafened: this.isDeafened,
        isVideoEnabled: false,
      })

      const errorMessage =
        videoError.name === 'NotReadableError' || /device in use/i.test(videoError.message ?? '')
          ? 'La cámara está en uso por otra pestaña o aplicación. Ciérrala e inténtalo de nuevo.'
          : videoError.message ||
            'No se pudo activar la cámara. Revisa los permisos del navegador.'

      this.onError?.(errorMessage)
    }
  }

  scheduleVideoBind(attendeeId, tileId, attempt = 0) {
    const normalizedAttendeeId = this.normalizeAttendeeId(attendeeId)
    const registeredElement = this.videoElements.get(normalizedAttendeeId)

    if (registeredElement) {
      this.bindVideoElement(tileId, registeredElement)
      return
    }

    if (attempt >= 20) return

    window.requestAnimationFrame(() => {
      this.scheduleVideoBind(normalizedAttendeeId, tileId, attempt + 1)
    })
  }

  bindVideoElement(tileId, videoElement) {
    if (!this.audioVideo || !videoElement || tileId == null) return

    try {
      this.audioVideo.bindVideoElement(tileId, videoElement)
    } catch (error) {
      this.onError?.(error.message)
    }
  }

  registerVideoElement(attendeeId, videoElement) {
    const normalizedAttendeeId = this.normalizeAttendeeId(attendeeId)

    if (!normalizedAttendeeId || !videoElement) return

    this.videoElements.set(normalizedAttendeeId, videoElement)

    const participant = this.participants.get(normalizedAttendeeId)

    if (participant?.tileId != null) {
      this.bindVideoElement(participant.tileId, videoElement)
    } else if (!participant?.isLocal) {
      this.syncVideoTilesForAttendee(normalizedAttendeeId)
    }
  }

  unregisterVideoElement(attendeeId) {
    const normalizedAttendeeId = this.normalizeAttendeeId(attendeeId)

    if (!normalizedAttendeeId) return

    this.videoElements.delete(normalizedAttendeeId)
  }
}
