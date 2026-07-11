import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  Headphones,
  Hash,
  LoaderCircle,
  MicOff,
  Plus,
  Send,
  Video,
  Volume2,
} from 'lucide-react'
import { io } from 'socket.io-client'
import AppShell from '../components/app-shell'
import UserAvatar from '../components/user-avatar'
import VoiceChannelPanel from '../components/voice-channel-panel'
import VoiceConnectedBar from '../components/voice-connected-bar'
import { useVoiceChannel } from '../hooks/use-voice-channel'
import { useVoiceChannelsPresence } from '../hooks/use-voice-channels-presence'
import { isFirebaseConfigured } from "../../infrastructure/firebase/firebase.client.js";
import {
  createVoiceChannelUseCase,
  getChannelMessagesUseCase,
  getServerChannelsUseCase,
  getServerMembersUseCase,
  voicePresenceRepository,
} from "../composition/container.js";
import { getTypingMessage } from "../utils/typing.js";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000'

function formatTime(date) {
  return new Intl.DateTimeFormat('es', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function shortenText(value = '', maxLength = 30) {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1).trimEnd()}…`
}

function ServerPage({
  currentUser,
  server,
  servers,
  onBack,
  onLogout,
  onProfile,
  onServerJoined,
  onServerSelected,
}) {
  const [channels, setChannels] = useState([])
  const [voiceChannels, setVoiceChannels] = useState([])
  const [selectedChannelId, setSelectedChannelId] = useState('')
  const [selectedVoiceChannelId, setSelectedVoiceChannelId] = useState('')
  const [selectedView, setSelectedView] = useState('text')
  const [messages, setMessages] = useState([])
  const [serverMembers, setServerMembers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [messageText, setMessageText] = useState('')
  const [error, setError] = useState('')
  const [voiceError, setVoiceError] = useState('')
  const [channelNotice, setChannelNotice] = useState('')
  const [isLoadingChannels, setIsLoadingChannels] = useState(true)
  const [isLoadingVoiceChannels, setIsLoadingVoiceChannels] = useState(true)
  const [isCreatingVoiceChannel, setIsCreatingVoiceChannel] = useState(false)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const messagesContainerRef = useRef(null)
  const socketRef = useRef(null)
  const noticeTimeoutRef = useRef(null)
  const typingStopTimeoutRef = useRef(null)
  const remoteTypingTimeoutsRef = useRef(new Map())

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId),
    [channels, selectedChannelId],
  )

  const selectedVoiceChannel = useMemo(
    () => voiceChannels.find((channel) => channel.id === selectedVoiceChannelId),
    [voiceChannels, selectedVoiceChannelId],
  )

  const isVoiceEnabled = isFirebaseConfigured()

  const voiceChannelIds = useMemo(
    () => voiceChannels.map((channel) => channel.id),
    [voiceChannels],
  )

  const voicePresenceByChannel = useVoiceChannelsPresence(
    server.id,
    voiceChannelIds,
    isVoiceEnabled,
  )

  const voiceSession = useVoiceChannel({
    serverId: server.id,
    channelId: selectedVoiceChannelId,
    currentUser,
  })

  const {
    participants: voiceParticipants,
    error: voiceSessionError,
    isConnecting: isVoiceConnecting,
    isJoined: isVoiceJoined,
    isMuted: isVoiceMuted,
    isDeafened: isVoiceDeafened,
    isVideoEnabled: isVoiceVideoEnabled,
    audioElementRef,
    join: joinVoiceChannel,
    toggleMute: toggleVoiceMute,
    toggleDeafen: toggleVoiceDeafen,
    toggleVideo: toggleVoiceVideo,
    registerVideoElement,
    unregisterVideoElement,
    leave: leaveVoiceChannel,
  } = voiceSession

  const membersByUsername = useMemo(
    () => new Map(
      serverMembers.map((member) => [member.user.username?.toLowerCase(), member.user]),
    ),
    [serverMembers],
  )

  const typingMessage = getTypingMessage(typingUsers)

  useEffect(() => {
    let isActive = true

    Promise.all([
      getServerChannelsUseCase.execute({ serverId: server.id }),
      getServerMembersUseCase.execute({ serverId: server.id }),
    ])
      .then(([loadedChannels, loadedMembers]) => {
        if (!isActive) return

        setChannels(loadedChannels)
        setServerMembers(loadedMembers)
        setSelectedChannelId(loadedChannels[0]?.id ?? '')
        setSelectedView(loadedChannels[0]?.id ? 'text' : 'voice')
        setError('')
      })
      .catch((currentError) => {
        if (isActive) setError(currentError.message)
      })
      .finally(() => {
        if (isActive) setIsLoadingChannels(false)
      })

    return () => {
      isActive = false
    }
  }, [server.id])

  useEffect(() => {
    if (!isVoiceEnabled) {
      setIsLoadingVoiceChannels(false)
      return undefined
    }

    const unsubscribe = voicePresenceRepository.subscribeVoiceChannels(
      server.id,
      (loadedVoiceChannels) => {
        setVoiceChannels(loadedVoiceChannels)
        setVoiceError('')
        setIsLoadingVoiceChannels(false)
      },
      (currentError) => {
        setVoiceError(currentError.message)
        setIsLoadingVoiceChannels(false)
      },
    )

    return unsubscribe
  }, [server.id, isVoiceEnabled])

  useEffect(() => {
    if (selectedView !== 'text' || !selectedChannelId) return

    let isActive = true

    getChannelMessagesUseCase.execute({ channelId: selectedChannelId })
      .then((loadedMessages) => {
        if (!isActive) return

        setMessages((currentMessages) => {
          const historyMessages = loadedMessages ?? []
          const historyIds = new Set(
            historyMessages.map((message) => message._id ?? message.id),
          )
          const liveMessagesNotInHistory = currentMessages.filter((message) => {
            const messageId = message._id ?? message.id

            return (
              String(message.channelId) === String(selectedChannelId) &&
              !historyIds.has(messageId)
            )
          })

          return [...historyMessages, ...liveMessagesNotInHistory]
        })
      })
      .catch((currentError) => {
        if (isActive) setError(currentError.message)
      })

    return () => {
      isActive = false
    }
  }, [selectedChannelId, selectedView])

  useEffect(() => {
    if (selectedView !== 'text' || !selectedChannelId || !currentUser?.username) return

    const socket = io(SOCKET_URL)
    const remoteTypingTimeouts = remoteTypingTimeoutsRef.current
    socketRef.current = socket

    socket.on('connect', () => {
      setIsSocketConnected(true)
      socket.emit('join_channel', {
        username: currentUser.username,
        channelId: selectedChannelId,
        avatarUrl: currentUser.avatarUrl,
      })
    })

    socket.on('receive_message', (data) => {
      if (String(data.channelId) !== String(selectedChannelId)) return

      const newMessage = {
        _id: data.id ?? data._id ?? `${Date.now()}`,
        username: data.username ?? data.usuario,
        content: data.content ?? data.mensaje,
        avatarUrl: data.avatarUrl ?? null,
        channelId: data.channelId,
        createdAt: data.createdAt ?? new Date().toISOString(),
        type: data.type ?? 'public',
      }

      setMessages((currentMessages) => {
        const alreadyExists = currentMessages.some(
          (message) => (message._id ?? message.id) === newMessage._id,
        )

        return alreadyExists ? currentMessages : [...currentMessages, newMessage]
      })
    })

    socket.on('system_message', (data) => {
      setChannelNotice(data.mensaje ?? 'Actividad nueva en el canal')

      window.clearTimeout(noticeTimeoutRef.current)
      noticeTimeoutRef.current = window.setTimeout(() => {
        setChannelNotice('')
      }, 4000)
    })

    socket.on('typing_update', ({ username, isTyping }) => {
      if (!username || username === currentUser.username) return

      const activeTimeout = remoteTypingTimeouts.get(username)
      if (activeTimeout) window.clearTimeout(activeTimeout)

      setTypingUsers((currentUsers) => {
        const nextUsers = new Set(currentUsers)

        if (isTyping) nextUsers.add(username)
        else nextUsers.delete(username)

        return [...nextUsers]
      })

      if (isTyping) {
        const timeout = window.setTimeout(() => {
          setTypingUsers((currentUsers) => currentUsers.filter((user) => user !== username))
          remoteTypingTimeouts.delete(username)
        }, 4000)

        remoteTypingTimeouts.set(username, timeout)
      } else {
        remoteTypingTimeouts.delete(username)
      }
    })

    socket.on('error_message', (data) => {
      setError(data.message ?? 'Error en la conexión del socket')
    })

    socket.on('disconnect', () => {
      setIsSocketConnected(false)
      setTypingUsers([])
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
      setIsSocketConnected(false)
      setTypingUsers([])
      window.clearTimeout(noticeTimeoutRef.current)
      window.clearTimeout(typingStopTimeoutRef.current)
      remoteTypingTimeouts.forEach((timeout) => window.clearTimeout(timeout))
      remoteTypingTimeouts.clear()
    }
  }, [selectedChannelId, selectedView, currentUser?.avatarUrl, currentUser?.username])

  async function handleLeaveVoiceChannel() {
    await leaveVoiceChannel()
    setSelectedView('text')
    setSelectedVoiceChannelId('')
    setSelectedChannelId(channels[0]?.id ?? '')
    setVoiceError('')
  }

  function handleSelectTextChannel(channelId) {
    setSelectedView('text')
    setSelectedChannelId(channelId)
    setSelectedVoiceChannelId('')
    setError('')
  }

  function handleSelectVoiceChannel(channelId) {
    setSelectedView('voice')
    setSelectedVoiceChannelId(channelId)
    setSelectedChannelId('')
    setVoiceError('')
  }

  async function handleCreateVoiceChannel() {
    const channelName = window.prompt('Nombre del canal de voz', 'General voz')

    if (!channelName?.trim()) return

    try {
      setIsCreatingVoiceChannel(true)
      setVoiceError('')

      const createdChannel = await createVoiceChannelUseCase.execute({
        serverId: server.id,
        name: channelName.trim(),
        user: currentUser,
      })

      handleSelectVoiceChannel(createdChannel.id)
    } catch (currentError) {
      setVoiceError(currentError.message)
    } finally {
      setIsCreatingVoiceChannel(false)
    }
  }

  useLayoutEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [messages, selectedChannelId])

  function handleSendMessage(event) {
    event.preventDefault()

    if (!selectedChannel || !messageText.trim()) return

    if (!socketRef.current || !isSocketConnected) {
      setError('No hay conexión activa con el socket')
      return
    }

    socketRef.current.emit('send_message', {
      username: currentUser.username,
      channelId: selectedChannel.id,
      message: messageText.trim(),
      avatarUrl: currentUser.avatarUrl,
    })

    socketRef.current.emit('typing_stop', {
      username: currentUser.username,
      channelId: selectedChannel.id,
    })
    window.clearTimeout(typingStopTimeoutRef.current)
    setMessageText('')
  }

  function handleMessageChange(event) {
    const value = event.target.value
    setMessageText(value)

    if (!socketRef.current || !selectedChannel) return

    window.clearTimeout(typingStopTimeoutRef.current)

    if (!value.trim()) {
      socketRef.current.emit('typing_stop', {
        username: currentUser.username,
        channelId: selectedChannel.id,
      })
      return
    }

    socketRef.current.emit('typing_start', {
      username: currentUser.username,
      channelId: selectedChannel.id,
    })

    typingStopTimeoutRef.current = window.setTimeout(() => {
      socketRef.current?.emit('typing_stop', {
        username: currentUser.username,
        channelId: selectedChannel.id,
      })
    }, 1500)
  }

  const sidebarHeader = (
    <div className="border-b border-slate-200 p-4 dark:border-white/10">
      <button
        type="button"
        className="mb-3 text-sm font-semibold text-slate-500 transition hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300"
        onClick={onBack}
      >
        ← Volver al inicio
      </button>
      <h1 className="truncate text-lg font-black" title={server.name}>
        {shortenText(server.name)}
      </h1>
      <p className="mt-1 overflow-hidden text-sm leading-5 text-slate-500 dark:text-slate-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
        {server.description || 'Servidor de LinkChat'}
      </p>
    </div>
  )

  const sidebarContent = (
    <section className="space-y-5 p-4">
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-normal text-slate-600 dark:text-slate-300">
          <Hash size={16} /> Canales de texto
        </div>

        {isLoadingChannels ? (
          <p className="flex items-center gap-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-500 dark:bg-white/10 dark:text-slate-300">
            <LoaderCircle className="animate-spin" size={16} /> Cargando canales…
          </p>
        ) : null}

        {!isLoadingChannels && channels.length === 0 ? (
          <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-500 dark:bg-white/10 dark:text-slate-300">
            Este servidor no tiene canales de texto.
          </p>
        ) : null}

        <div className="grid gap-2">
          {channels.map((channel) => (
            <button
              type="button"
              key={channel.id}
              className={`flex min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-left transition ${selectedView === 'text' && channel.id === selectedChannelId ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'}`}
              onClick={() => handleSelectTextChannel(channel.id)}
            >
              <Hash className="shrink-0" size={17} />
              <span className="truncate">{channel.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-normal text-slate-600 dark:text-slate-300">
            <Volume2 size={16} /> Canales de voz
          </div>
          {isVoiceEnabled ? (
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-lg bg-teal-600 text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              title="Crear canal de voz"
              onClick={handleCreateVoiceChannel}
              disabled={isCreatingVoiceChannel}
            >
              {isCreatingVoiceChannel ? (
                <LoaderCircle className="animate-spin" size={16} />
              ) : (
                <Plus size={16} />
              )}
            </button>
          ) : null}
        </div>

        {!isVoiceEnabled ? (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            Configura Firebase en `frontend/.env` para habilitar canales de voz.
          </p>
        ) : null}

        {isVoiceEnabled && isLoadingVoiceChannels ? (
          <p className="flex items-center gap-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-500 dark:bg-white/10 dark:text-slate-300">
            <LoaderCircle className="animate-spin" size={16} /> Cargando voz…
          </p>
        ) : null}

        {isVoiceEnabled && !isLoadingVoiceChannels && voiceChannels.length === 0 ? (
          <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-500 dark:bg-white/10 dark:text-slate-300">
            Crea un canal de voz con el botón +.
          </p>
        ) : null}

        <div className="grid gap-1">
          {voiceChannels.map((channel) => {
            const isActiveVoice =
              selectedView === 'voice' && channel.id === selectedVoiceChannelId
            const channelParticipants =
              selectedView === 'voice' && channel.id === selectedVoiceChannelId && isVoiceJoined
                ? voiceParticipants
                : voicePresenceByChannel[channel.id] ?? []
            const participantCount = channelParticipants.length

            return (
              <div key={channel.id} className="grid gap-1">
                <button
                  type="button"
                  className={`flex min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-left transition ${isActiveVoice ? 'bg-emerald-600/20 text-emerald-700 dark:text-emerald-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'}`}
                  onClick={() => handleSelectVoiceChannel(channel.id)}
                >
                  <Volume2
                    className={`shrink-0 ${isActiveVoice ? 'text-emerald-500' : ''}`}
                    size={17}
                  />
                  <span className="truncate">{channel.name}</span>
                  {participantCount > 0 ? (
                    <span className="ml-auto shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
                      {participantCount}
                    </span>
                  ) : null}
                </button>

                {channelParticipants.length > 0 ? (
                  <div className="ml-2 grid gap-1 border-l border-emerald-500/30 pl-3">
                    {channelParticipants.map((participant) => (
                      <div
                        key={participant.userId}
                        className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-600 dark:text-slate-300"
                      >
                        <UserAvatar
                          user={participant}
                          name={participant.username || participant.name}
                          className="size-6 shrink-0"
                          textClassName="text-[10px]"
                        />
                        <span className="truncate">
                          {participant.username || participant.name}
                        </span>
                        {participant.isMuted ? (
                          <MicOff size={14} className="shrink-0 text-red-400" />
                        ) : null}
                        {participant.isDeafened ? (
                          <Headphones size={14} className="shrink-0 text-red-400" />
                        ) : null}
                        {participant.isVideoEnabled ? (
                          <Video size={14} className="shrink-0 text-emerald-400" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )

  return (
    <AppShell
      currentUser={currentUser}
      servers={servers}
      selectedServer={server}
      onHome={onBack}
      onLogout={onLogout}
      onProfile={onProfile}
      onServerJoined={onServerJoined}
      onServerSelected={onServerSelected}
      sidebarHeader={sidebarHeader}
      sidebarContent={sidebarContent}
      sidebarFooter={
        selectedView === 'voice' && selectedVoiceChannel && isVoiceJoined ? (
          <VoiceConnectedBar
            channelName={selectedVoiceChannel.name}
            serverName={server.name}
            isMuted={isVoiceMuted}
            isDeafened={isVoiceDeafened}
          />
        ) : null
      }
      mobileTitle={
        selectedView === 'voice'
          ? selectedVoiceChannel?.name ?? 'Canal de voz'
          : selectedChannel
            ? `# ${selectedChannel.name}`
            : server.name
      }
    >
      {selectedView === 'voice' && selectedVoiceChannel ? (
        <>
          <VoiceChannelPanel
            channel={selectedVoiceChannel}
            currentUser={currentUser}
            participants={voiceParticipants}
            audioElementRef={audioElementRef}
            isConnecting={isVoiceConnecting}
            isJoined={isVoiceJoined}
            isMuted={isVoiceMuted}
            isDeafened={isVoiceDeafened}
            isVideoEnabled={isVoiceVideoEnabled}
            error={voiceSessionError || voiceError}
            onJoin={joinVoiceChannel}
            onToggleMute={toggleVoiceMute}
            onToggleDeafen={toggleVoiceDeafen}
            onToggleVideo={toggleVoiceVideo}
            onDisconnect={handleLeaveVoiceChannel}
            registerVideoElement={registerVideoElement}
            unregisterVideoElement={unregisterVideoElement}
          />
        </>
      ) : (
        <section className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
          <header className="flex min-h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 dark:border-white/10 dark:bg-slate-950 sm:min-h-20 sm:px-5">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-normal text-teal-600 dark:text-teal-400">Canal</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                {isSocketConnected ? 'Conectado en tiempo real' : 'Sin conexión en tiempo real'}
              </p>
              <h2 className="flex min-w-0 items-center gap-1.5 text-lg font-semibold sm:gap-2 sm:text-xl">
                <Hash className="shrink-0" size={20} />
                <span className="truncate">{selectedChannel?.name ?? 'Selecciona un canal'}</span>
              </h2>
            </div>
          </header>

          {error || voiceError ? (
            <div className="mx-4 mt-4 flex shrink-0 items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
              <span>{error || voiceError}</span>
            </div>
          ) : null}

          {channelNotice ? (
            <div className="pointer-events-none absolute inset-x-3 top-20 z-20 min-w-0 overflow-hidden rounded-lg border border-teal-200 bg-teal-50/95 px-3 py-2.5 text-sm font-semibold text-teal-800 shadow-lg backdrop-blur dark:border-teal-800 dark:bg-teal-950/95 dark:text-teal-200 sm:inset-x-4 sm:top-24 sm:px-4 sm:py-3">
              <p className="truncate">{channelNotice}</p>
            </div>
          ) : null}

          <div
            ref={messagesContainerRef}
            className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-3 sm:px-5 sm:py-4"
          >
            {!selectedChannel ? (
              <div className="grid h-full place-items-center text-center text-slate-500 dark:text-slate-400">
                <p>Selecciona un canal para conversar en este servidor.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="grid h-full place-items-center text-center text-slate-500 dark:text-slate-400">
                <p>No hay mensajes todavía en #{selectedChannel.name}.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {messages.map((message) => {
                  const isMine = message.username === currentUser.username
                  const member = membersByUsername.get(message.username?.toLowerCase())
                  const messageUser = isMine
                    ? currentUser
                    : {
                        name: member?.name,
                        username: message.username,
                        avatarUrl: member?.avatarUrl ?? message.avatarUrl,
                      }

                  return (
                    <div
                      key={message._id ?? message.id}
                      className={`flex w-full items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}
                    >
                      <UserAvatar
                        user={messageUser}
                        className="size-8 shrink-0 sm:size-9"
                        textClassName="text-xs"
                      />
                      <article
                        className={`max-w-[85%] rounded-xl px-3 py-2.5 shadow-sm sm:max-w-[min(75%,42rem)] sm:px-4 sm:py-3 ${isMine ? 'bg-teal-700 text-white' : 'bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100'}`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <strong className={`text-sm ${isMine ? 'text-teal-50' : 'text-teal-700 dark:text-teal-300'}`}>
                            {message.username}
                          </strong>
                          <time className={`text-xs ${isMine ? 'text-teal-50' : 'text-slate-400'}`}>
                            {formatTime(message.createdAt)}
                          </time>
                        </div>
                        <p className="break-words">{message.content}</p>
                      </article>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white px-3 pb-3 pt-1.5 dark:border-white/10 dark:bg-slate-950 sm:px-4 sm:pb-4 sm:pt-2">
            <p
              className="h-6 truncate px-1 text-sm font-medium text-slate-500 dark:text-slate-400"
              aria-live="polite"
            >
              {typingMessage}
            </p>
            <form className="flex gap-3" onSubmit={handleSendMessage}>
              <input
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 dark:border-white/10 dark:bg-slate-800 dark:text-white dark:focus:ring-teal-900 sm:min-h-12 sm:px-4"
                type="text"
                placeholder={selectedChannel ? `Mensaje para #${selectedChannel.name}` : 'Selecciona un canal'}
                value={messageText}
                onChange={handleMessageChange}
                disabled={!selectedChannel}
              />
              <button
                type="submit"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700 sm:min-h-12 sm:px-5"
                disabled={!selectedChannel || !messageText.trim()}
              >
                <Send size={18} />
                <span className="max-sm:hidden">Enviar</span>
              </button>
            </form>
          </div>
        </section>
      )}
    </AppShell>
  )
}

export default ServerPage
