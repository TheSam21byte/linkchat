import { useEffect, useMemo, useRef } from 'react'
import {
  AlertCircle,
  Expand,
  ExternalLink,
  Gamepad2,
  Headphones,
  LoaderCircle,
  MessageCircle,
  Mic,
  MicOff,
  MonitorUp,
  MoreHorizontal,
  PhoneOff,
  Sparkles,
  UserPlus,
  Video,
  VideoOff,
  Volume2,
} from 'lucide-react'
import UserAvatar from './user-avatar'

const CARD_COLORS = [
  'bg-[#5865f2]',
  'bg-[#ed4245]',
  'bg-[#3ba55d]',
  'bg-[#faa61a]',
  'bg-[#eb459e]',
  'bg-[#57f287]',
]

function getCardColor(seed = '') {
  const hash = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0)
  return CARD_COLORS[hash % CARD_COLORS.length]
}

function getStageLayout(tileCount) {
  if (tileCount <= 1) return { columns: 1, rows: 1 }
  if (tileCount === 2) return { columns: 2, rows: 1 }
  if (tileCount <= 4) return { columns: 2, rows: 2 }
  if (tileCount <= 6) return { columns: 3, rows: 2 }
  if (tileCount <= 9) return { columns: 3, rows: 3 }

  const columns = 4
  return { columns, rows: Math.ceil(tileCount / columns) }
}

function VoiceParticipantTile({
  participant,
  currentUserId,
  compact,
  isVideoEnabledOverride = false,
  registerVideoElement,
  unregisterVideoElement,
}) {
  const videoRef = useRef(null)
  const isCurrentUser = String(participant.userId) === String(currentUserId)
  const displayName = participant.username || participant.name
  const avatarSize = compact ? 'size-20 sm:size-24' : 'size-28 sm:size-36 md:size-40'
  const isCameraOn = isCurrentUser
    ? Boolean(isVideoEnabledOverride)
    : Boolean(participant.isVideoEnabled)
  const isScreenSharing = Boolean(participant.isScreenSharing)
  const hasLiveVideo = isCameraOn && participant.tileId != null
  const hasMedia = hasLiveVideo || isScreenSharing
  const isMediaLoading = isCameraOn && participant.tileId == null && !isScreenSharing
  const attendeeKey = participant.attendeeId ?? participant.userId

  useEffect(() => {
    if (!videoRef.current || !attendeeKey) return undefined

    registerVideoElement?.(attendeeKey, videoRef.current)

    return () => {
      unregisterVideoElement?.(attendeeKey)
    }
  }, [attendeeKey, registerVideoElement, unregisterVideoElement])

  useEffect(() => {
    if (isCameraOn || !videoRef.current) return

    videoRef.current.srcObject = null
  }, [isCameraOn])

  return (
    <article
      className={`relative flex h-full min-h-0 overflow-hidden rounded-xl border border-white/10 ${hasLiveVideo || isScreenSharing ? 'bg-black' : getCardColor(participant.username)}`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted={isCurrentUser}
        playsInline
        className={`absolute inset-0 z-10 h-full w-full object-cover ${hasLiveVideo ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      {!hasLiveVideo && !isScreenSharing ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <UserAvatar
            user={participant}
            name={displayName}
            className={`${avatarSize} rounded-full border-4 border-white/15 shadow-2xl`}
            textClassName={compact ? 'text-2xl' : 'text-4xl'}
          />
        </div>
      ) : null}

      {isMediaLoading ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/50">
          <LoaderCircle className="animate-spin text-white/70" size={28} />
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-30 p-3">
        <div className="inline-flex max-w-[calc(100%-0.5rem)] items-center gap-2 rounded-md bg-black/80 px-2 py-1 backdrop-blur-sm">
          {participant.isMuted ? (
            <MicOff size={14} className="shrink-0 text-red-400" />
          ) : (
            <Mic size={14} className="shrink-0 text-emerald-400" />
          )}
          {participant.isDeafened ? (
            <Headphones size={14} className="shrink-0 text-red-400" />
          ) : null}
          {isCameraOn ? (
            <Video size={14} className="shrink-0 text-emerald-400" />
          ) : null}
          {isScreenSharing ? (
            <MonitorUp size={14} className="shrink-0 text-emerald-400" />
          ) : null}
          <span className="truncate text-sm font-semibold text-white">
            {displayName}
            {isCurrentUser ? ' (Tú)' : ''}
          </span>
        </div>
      </div>
    </article>
  )
}

function VoiceInviteTile({ compact }) {
  return (
    <article className="relative flex h-full min-h-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black p-4 text-center">
      <div
        className={`mb-4 grid place-items-center rounded-2xl border border-white/10 bg-[#111111] text-slate-300 ${compact ? 'size-16' : 'size-24'}`}
      >
        <Gamepad2 size={compact ? 28 : 40} />
      </div>

      <button
        type="button"
        className="mb-2 inline-flex min-h-10 w-full max-w-[220px] items-center justify-center gap-2 rounded-lg bg-[#248046] px-3 text-sm font-semibold text-white transition hover:bg-[#1a6334]"
        disabled
      >
        <UserPlus size={16} />
        Invitar al chat de voz
      </button>

      <button
        type="button"
        className="inline-flex min-h-9 w-full max-w-[220px] items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#111111] px-3 text-sm font-semibold text-slate-100 transition hover:bg-[#1a1a1a]"
        disabled
      >
        Elegir actividad
      </button>
    </article>
  )
}

function VoiceJoinPrompt({ channelName, isConnecting, onJoin }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
      <div className="grid size-24 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
        <Volume2 size={42} />
      </div>
      <div className="max-w-md space-y-2 px-4">
        <h3 className="text-2xl font-bold text-white">{channelName}</h3>
        <p className="text-sm text-slate-400">
          Conéctate con Amazon Chime para hablar en tiempo real con los demás miembros del canal.
        </p>
      </div>
      <button
        type="button"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700"
        onClick={onJoin}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <LoaderCircle className="animate-spin" size={18} />
            Conectando…
          </>
        ) : (
          <>
            <Volume2 size={18} />
            Unirse a Voz
          </>
        )}
      </button>
    </div>
  )
}

function VoiceFloatingControls({
  isMuted,
  isDeafened,
  isVideoEnabled,
  onToggleMute,
  onToggleDeafen,
  onToggleVideo,
  onDisconnect,
}) {
  const isMicActive = !isMuted && !isDeafened
  const mediaButtonBase =
    'relative z-[101] grid size-11 place-items-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30'
  const mediaButtonActive =
    'bg-[#111111] text-emerald-400 ring-2 ring-emerald-500/40 hover:bg-[#1a1a1a] hover:ring-emerald-500/60'
  const mediaButtonDisabled =
    'bg-[#ed4245] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-[#c03537]'

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
      {isMicActive ? (
        <p className="pointer-events-none rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
          Micrófono activo
        </p>
      ) : null}

      {isVideoEnabled ? (
        <p className="pointer-events-none rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
          Cámara activa
        </p>
      ) : null}

      <div className="pointer-events-auto relative z-[101] flex items-center gap-1 rounded-xl border border-white/10 bg-black p-1.5 shadow-2xl">
        <button
          type="button"
          className={`${mediaButtonBase} ${isMuted || isDeafened ? mediaButtonDisabled : mediaButtonActive}`}
          onClick={() => onToggleMute?.()}
          title={isMuted || isDeafened ? 'Activar micrófono' : 'Silenciar micrófono'}
          aria-pressed={!(isMuted || isDeafened)}
        >
          {isMuted || isDeafened ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <button
          type="button"
          className={`${mediaButtonBase} ${isVideoEnabled ? mediaButtonActive : mediaButtonDisabled}`}
          onClick={() => onToggleVideo?.()}
          title={isVideoEnabled ? 'Apagar cámara' : 'Activar cámara'}
          aria-pressed={isVideoEnabled}
        >
          {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-lg bg-[#111111] text-slate-400"
          title="Compartir pantalla"
          disabled
        >
          <MonitorUp size={20} />
        </button>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-lg bg-[#111111] text-slate-300 hover:bg-[#1a1a1a]"
          title="Actividades"
          disabled
        >
          <Gamepad2 size={20} />
        </button>

        <button
          type="button"
          className={`relative z-[101] grid size-11 place-items-center rounded-lg transition ${isDeafened ? 'bg-[#ed4245] text-white' : 'bg-[#111111] text-slate-200 hover:bg-[#1a1a1a]'}`}
          onClick={() => onToggleDeafen?.()}
          title={isDeafened ? 'Activar audio' : 'Ensordecer'}
        >
          <Headphones size={20} />
        </button>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-lg bg-[#111111] text-slate-200 hover:bg-[#1a1a1a]"
          title="Efectos"
          disabled
        >
          <Sparkles size={20} />
        </button>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-lg bg-[#111111] text-slate-200 hover:bg-[#1a1a1a]"
          title="Más opciones"
          disabled
        >
          <MoreHorizontal size={20} />
        </button>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-lg bg-[#ed4245] text-white transition hover:bg-[#c03537]"
          onClick={onDisconnect}
          title="Salir del canal"
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  )
}

function VoiceChannelPanel({
  channel,
  currentUser,
  participants,
  audioElementRef,
  isConnecting,
  isJoined,
  isMuted,
  isDeafened,
  isVideoEnabled,
  error,
  onJoin,
  onToggleMute,
  onToggleDeafen,
  onToggleVideo,
  onDisconnect,
  registerVideoElement,
  unregisterVideoElement,
}) {
  const showInviteTile = isJoined && participants.length < 12

  const displayParticipants = useMemo(
    () =>
      participants.map((participant) => {
        if (String(participant.userId) !== String(currentUser.id)) {
          return participant
        }

        return {
          ...participant,
          isVideoEnabled,
          tileId: isVideoEnabled ? participant.tileId : null,
        }
      }),
    [participants, currentUser.id, isVideoEnabled],
  )

  const tiles = isJoined
    ? [
        ...displayParticipants.map((participant) => ({
          type: 'participant',
          key: participant.attendeeId ?? participant.userId,
          participant,
        })),
        ...(showInviteTile ? [{ type: 'invite', key: 'invite' }] : []),
      ]
    : []

  const tileCount = Math.max(tiles.length, 1)
  const { columns, rows } = getStageLayout(tileCount)
  const compactTiles = tileCount > 4

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden bg-black text-white">
      <audio ref={audioElementRef} className="hidden" aria-hidden="true" />

      <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Volume2 size={18} className="shrink-0 text-slate-300" />
          <h2 className="truncate text-base font-semibold">{channel.name}</h2>
        </div>

        <button
          type="button"
          className="grid size-9 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
          title="Abrir chat"
          disabled
        >
          <MessageCircle size={20} />
        </button>
      </header>

      {error ? (
        <div className="mx-4 mt-4 flex shrink-0 items-start gap-3 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="relative min-h-0 flex-1 bg-black p-3 sm:p-4">
        {!isJoined ? (
          <VoiceJoinPrompt
            channelName={channel.name}
            isConnecting={isConnecting}
            onJoin={onJoin}
          />
        ) : isConnecting ? (
          <div className="flex h-full items-center justify-center text-slate-300">
            <LoaderCircle className="mr-2 animate-spin" size={22} />
            Conectando al canal de voz…
          </div>
        ) : (
          <div
            className="grid h-full gap-3 pb-28"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            }}
          >
            {tiles.map((tile) =>
              tile.type === 'participant' ? (
                <VoiceParticipantTile
                  key={tile.key}
                  participant={tile.participant}
                  currentUserId={currentUser.id}
                  compact={compactTiles}
                  isVideoEnabledOverride={
                    String(tile.participant.userId) === String(currentUser.id)
                      ? isVideoEnabled
                      : false
                  }
                  registerVideoElement={registerVideoElement}
                  unregisterVideoElement={unregisterVideoElement}
                />
              ) : (
                <VoiceInviteTile key={tile.key} compact={compactTiles} />
              ),
            )}
          </div>
        )}

        {isJoined ? (
          <>
            <button
              type="button"
              className="absolute bottom-3 left-3 z-10 grid size-10 place-items-center rounded-full border border-white/10 bg-black/90 text-slate-200 shadow-lg transition hover:bg-[#111111]"
              title="Invitar"
              disabled
            >
              <UserPlus size={18} />
            </button>

            <div className="absolute bottom-3 right-3 z-10 flex gap-2">
              <button
                type="button"
                className="grid size-10 place-items-center rounded-full border border-white/10 bg-black/90 text-slate-200 shadow-lg transition hover:bg-[#111111]"
                title="Abrir en ventana"
                disabled
              >
                <ExternalLink size={18} />
              </button>
              <button
                type="button"
                className="grid size-10 place-items-center rounded-full border border-white/10 bg-black/90 text-slate-200 shadow-lg transition hover:bg-[#111111]"
                title="Pantalla completa"
                disabled
              >
                <Expand size={18} />
              </button>
            </div>

            <VoiceFloatingControls
              isMuted={isMuted}
              isDeafened={isDeafened}
              isVideoEnabled={isVideoEnabled}
              onToggleMute={onToggleMute}
              onToggleDeafen={onToggleDeafen}
              onToggleVideo={onToggleVideo}
              onDisconnect={onDisconnect}
            />
          </>
        ) : null}
      </div>
    </section>
  )
}

export default VoiceChannelPanel
