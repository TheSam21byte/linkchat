import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  Hash,
  LoaderCircle,
  Send,
} from 'lucide-react'
import { io } from 'socket.io-client'
import AppShell from '../components/app-shell'
import UserAvatar from '../components/user-avatar'
import { getChannelMessages, getServerChannels } from '../services/chat-api'
import { getServerMembers } from '../services/members-api'
import { getTypingMessage } from '../utils/typing'

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
  const [selectedChannelId, setSelectedChannelId] = useState('')
  const [messages, setMessages] = useState([])
  const [serverMembers, setServerMembers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [messageText, setMessageText] = useState('')
  const [error, setError] = useState('')
  const [channelNotice, setChannelNotice] = useState('')
  const [isLoadingChannels, setIsLoadingChannels] = useState(true)
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

  const membersByUsername = useMemo(
    () => new Map(
      serverMembers.map((member) => [member.user.username?.toLowerCase(), member.user]),
    ),
    [serverMembers],
  )

  const typingMessage = getTypingMessage(typingUsers)

  useEffect(() => {
    let isActive = true

    Promise.all([getServerChannels(server.id), getServerMembers(server.id)])
      .then(([loadedChannels, loadedMembers]) => {
        if (!isActive) return

        setChannels(loadedChannels)
        setServerMembers(loadedMembers)
        setSelectedChannelId(loadedChannels[0]?.id ?? '')
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
    if (!selectedChannelId) return

    let isActive = true

    getChannelMessages(selectedChannelId)
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
  }, [selectedChannelId])

  useEffect(() => {
    if (!selectedChannelId || !currentUser?.username) return

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
  }, [selectedChannelId, currentUser?.avatarUrl, currentUser?.username])

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
    <section className="p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-normal text-slate-600 dark:text-slate-300">
        <Hash size={16} /> Canales
      </div>

      {isLoadingChannels ? (
        <p className="flex items-center gap-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-500 dark:bg-white/10 dark:text-slate-300">
          <LoaderCircle className="animate-spin" size={16} /> Cargando canales…
        </p>
      ) : null}

      {!isLoadingChannels && channels.length === 0 ? (
        <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-500 dark:bg-white/10 dark:text-slate-300">
          Este servidor no tiene canales.
        </p>
      ) : null}

      <div className="grid gap-2">
        {channels.map((channel) => (
          <button
            type="button"
            key={channel.id}
            className={`flex min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-left transition ${channel.id === selectedChannelId ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'}`}
            onClick={() => setSelectedChannelId(channel.id)}
          >
            <Hash className="shrink-0" size={17} />
            <span className="truncate">{channel.name}</span>
          </button>
        ))}
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
      mobileTitle={selectedChannel ? `# ${selectedChannel.name}` : server.name}
    >
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

          {error ? (
            <div className="mx-4 mt-4 flex shrink-0 items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
              <span>{error}</span>
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
    </AppShell>
  )
}

export default ServerPage
