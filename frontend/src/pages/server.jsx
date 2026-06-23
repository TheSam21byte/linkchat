import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Copy,
  Hash,
  Link2,
  LoaderCircle,
  LogOut,
  Send,
} from 'lucide-react'
import AppLogo from '../components/app-logo'
import {
  getChannelMessages,
  getServerChannels,
} from '../services/chat-api'
import { createInvitation } from '../services/invitations-api'
import { io } from 'socket.io-client'
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000'
function formatTime(date) {
  return new Intl.DateTimeFormat('es', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function ServerPage({ currentUser, server, onBack, onLogout }) {
  const [channels, setChannels] = useState([])
  const [selectedChannelId, setSelectedChannelId] = useState('')
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [error, setError] = useState('')
  const [channelNotice, setChannelNotice] = useState('')
  const [isLoadingChannels, setIsLoadingChannels] = useState(true)
  const [inviteUrl, setInviteUrl] = useState('')
  const [isCreatingInvite, setIsCreatingInvite] = useState(false)
  const [inviteFeedback, setInviteFeedback] = useState('')
  const messagesEndRef = useRef(null)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const socketRef = useRef(null)
  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId),
    [channels, selectedChannelId],
  )



  useEffect(() => {
    let isActive = true

    getServerChannels(server.id)
      .then((loadedChannels) => {
        if (!isActive) return

        setChannels(loadedChannels)
        setSelectedChannelId(loadedChannels[0]?.id ?? '')
        setError('')
      })
      .catch((currentError) => {
        if (!isActive) return

        setError(currentError.message)
      })
      .finally(() => {
        if (!isActive) return

        setIsLoadingChannels(false)
      })

    return () => {
      isActive = false
    }
  }, [server.id])

  useEffect(() => {
    if (!selectedChannelId) {
      return
    }

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
        if (!isActive) return

        setError(currentError.message)
      })

    return () => {
      isActive = false
    }
  }, [selectedChannelId])

  useEffect(() => {
    if (!selectedChannelId || !currentUser?.username) return

    const socket = io(SOCKET_URL)

    socketRef.current = socket

    socket.on('connect', () => {
      setIsSocketConnected(true)

      socket.emit('join_channel', {
        username: currentUser.username,
        channelId: selectedChannelId,
      })
    })

    socket.on('receive_message', (data) => {
      if (String(data.channelId) !== String(selectedChannelId)) return

      const newMessage = {
        _id: data.id ?? data._id ?? `${Date.now()}`,
        username: data.username ?? data.usuario,
        content: data.content ?? data.mensaje,
        channelId: data.channelId,
        createdAt: data.createdAt ?? new Date().toISOString(),
        type: data.type ?? 'public',
      }

      setMessages((currentMessages) => {
        const alreadyExists = currentMessages.some(
          (message) => (message._id ?? message.id) === newMessage._id,
        )

        if (alreadyExists) return currentMessages

        return [...currentMessages, newMessage]
      })
    })

    socket.on('system_message', (data) => {
      setChannelNotice(data.mensaje ?? 'Actividad nueva en el canal')

      const systemMessage = {
        _id: `system-${Date.now()}`,
        username: data.usuario ?? 'Sistema',
        content: data.mensaje,
        channelId: data.channelId ?? selectedChannelId,
        createdAt: new Date().toISOString(),
        type: 'system',
      }

      setMessages((currentMessages) => [...currentMessages, systemMessage])
    })

    socket.on('users_list', (users) => {
      const userNames = users.map((user) => user.username).join(', ')
      const notice = userNames
        ? `Usuarios conectados: ${userNames}`
        : 'No hay otros usuarios conectados en este canal'

      setChannelNotice(notice)

      const systemMessage = {
        _id: `users-${Date.now()}`,
        username: 'Sistema',
        content: notice,
        channelId: selectedChannelId,
        createdAt: new Date().toISOString(),
        type: 'system',
      }

      setMessages((currentMessages) => [...currentMessages, systemMessage])
    })

    socket.on('receive_private_message', (data) => {
      const privateMessage = {
        _id: `private-${Date.now()}`,
        username: data.usuario ?? 'Privado',
        content: `🔒 ${data.mensaje}`,
        channelId: selectedChannelId,
        createdAt: new Date().toISOString(),
        type: 'private',
      }

      setMessages((currentMessages) => [...currentMessages, privateMessage])
    })

    socket.on('private_message_sent', (data) => {
      const privateMessage = {
        _id: `private-sent-${Date.now()}`,
        username: currentUser.username,
        content: `🔒 Para ${data.usuario}: ${data.mensaje}`,
        channelId: selectedChannelId,
        createdAt: new Date().toISOString(),
        type: 'private',
      }

      setMessages((currentMessages) => [...currentMessages, privateMessage])
    })

    socket.on('error_message', (data) => {
      setError(data.message ?? 'Error en la conexión del socket')
    })

    socket.on('disconnect', () => {
      setIsSocketConnected(false)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
      setIsSocketConnected(false)
    }
  }, [selectedChannelId, currentUser?.username])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages, selectedChannelId])

  async function handleCreateInvite() {
    try {
      setIsCreatingInvite(true)
      setInviteFeedback('')
      setError('')

      const result = await createInvitation({ serverId: server.id })
      setInviteUrl(result.inviteUrl)
      setInviteFeedback('Enlace de invitación generado')
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setIsCreatingInvite(false)
    }
  }

  async function handleCopyInvite() {
    if (!inviteUrl) return

    try {
      await navigator.clipboard.writeText(inviteUrl)
      setInviteFeedback('Enlace copiado al portapapeles')
    } catch {
      setInviteFeedback('No se pudo copiar el enlace automáticamente')
    }
  }

  function handleSendMessage(event) {
    event.preventDefault()

    if (!selectedChannel || !messageText.trim()) return

    if (!socketRef.current || !isSocketConnected) {
      setError('No hay conexión activa con el socket')
      return
    }

    const text = messageText.trim()

    if (text === '/usuarios') {
      socketRef.current.emit('get_users', {
        channelId: selectedChannel.id,
      })
      setMessageText('')
      return
    }

    if (text.startsWith('/privado ')) {
      const parts = text.split(' ')

      if (parts.length < 3) {
        setError('Uso correcto: /privado NombreUsuario mensaje')
        return
      }

      const toUsername = parts[1]
      const privateMessage = parts.slice(2).join(' ')

      socketRef.current.emit('private_message', {
        toUsername,
        fromUsername: currentUser.username,
        message: privateMessage,
        channelId: selectedChannel.id,
      })

      setMessageText('')
      return
    }

    socketRef.current.emit('send_message', {
      username: currentUser.username,
      channelId: selectedChannel.id,
      message: text,
    })

    setMessageText('')
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="grid min-h-screen grid-cols-[300px_1fr] max-md:grid-cols-1">
        <aside className="border-r border-slate-200 bg-slate-950 text-white">
          <div className="border-b border-white/10 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <button
                type="button"
                className="inline-flex size-10 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
                onClick={onBack}
                title="Volver"
              >
                <ArrowLeft size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="inline-flex size-10 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
                onClick={onLogout}
                title="Salir"
              >
                <LogOut size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-start gap-3">
              <AppLogo imageClassName="size-12" />
              <div className="min-w-0">
                <h1 className="break-words text-xl font-semibold">
                  {server.name}
                </h1>
                <p className="mt-1 text-sm text-white/60">
                  {server.description || 'Servidor de LinkChat'}
                </p>
              </div>
            </div>
          </div>

          <section className="p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-normal text-white/70">
              <Hash size={16} aria-hidden="true" />
              Canales
            </div>

            {isLoadingChannels ? (
              <p className="flex items-center gap-2 rounded-lg bg-white/10 p-3 text-sm text-white/70">
                <LoaderCircle className="animate-spin" size={16} />
                Cargando canales...
              </p>
            ) : null}

            {!isLoadingChannels && channels.length === 0 ? (
              <p className="rounded-lg bg-white/10 p-3 text-sm text-white/70">
                Este servidor no tiene canales.
              </p>
            ) : null}

            <div className="grid gap-2">
              {channels.map((channel) => {
                const isSelected = channel.id === selectedChannelId

                return (
                  <button
                    type="button"
                    key={channel.id}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left transition ${isSelected
                      ? 'bg-teal-600 text-white'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                      }`}
                    onClick={() => setSelectedChannelId(channel.id)}
                  >
                    <Hash size={17} aria-hidden="true" />
                    <span className="truncate">{channel.name}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="border-t border-white/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-normal text-white/70">
              <Link2 size={16} aria-hidden="true" />
              Invitación
            </div>

            <button
              type="button"
              className="mb-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleCreateInvite}
              disabled={isCreatingInvite}
            >
              {isCreatingInvite ? (
                <LoaderCircle className="animate-spin" size={16} />
              ) : (
                <Link2 size={16} aria-hidden="true" />
              )}
              Generar enlace
            </button>

            {inviteUrl ? (
              <div className="rounded-lg bg-white/10 p-3 text-sm text-white/80">
                <p className="mb-2 break-all">{inviteUrl}</p>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-teal-500"
                  onClick={handleCopyInvite}
                >
                  <Copy size={14} aria-hidden="true" />
                  Copiar enlace
                </button>
              </div>
            ) : null}

            {inviteFeedback ? (
              <p className="mt-2 text-xs text-teal-200">{inviteFeedback}</p>
            ) : null}

            <p className="mt-3 text-xs text-white/50">
              Comandos: /usuarios, /privado NombreUsuario mensaje
            </p>
          </section>
        </aside>

        <section className="flex min-h-screen min-w-0 flex-col bg-slate-50 max-md:min-h-[70vh]">
          <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-normal text-teal-700">
                Canal
              </p>
              <p className="text-sm text-slate-500">
                {isSocketConnected ? 'Conectado en tiempo real' : 'Sin conexión en tiempo real'}
              </p>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <Hash size={20} aria-hidden="true" />
                {selectedChannel?.name ?? 'Selecciona un canal'}
              </h2>
            </div>
            <AppLogo imageClassName="size-10" />
          </header>

          {error ? (
            <div className="m-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
              <span>{error}</span>
            </div>
          ) : null}

          {channelNotice ? (
            <div className="mx-4 mt-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
              {channelNotice}
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {!selectedChannel ? (
              <div className="grid h-full place-items-center text-center text-slate-500">
                <p>Selecciona un canal para conversar en este servidor.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="grid h-full place-items-center text-center text-slate-500">
                <p>No hay mensajes todavia en #{selectedChannel.name}.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {messages.map((message) => {
                  const isMine = message.username === currentUser.username
                  const isSystem = message.type === 'system'
                  const isPrivate = message.type === 'private'

                  return (
                    <article
                      key={message._id ?? message.id}
                      className={`max-w-[75%] rounded-lg px-4 py-3 shadow-sm ${
                        isSystem
                          ? 'mx-auto bg-slate-200 text-slate-700'
                          : isPrivate
                            ? isMine
                              ? 'ml-auto border border-violet-200 bg-violet-100 text-violet-950'
                              : 'mr-auto border border-violet-200 bg-violet-50 text-violet-950'
                            : isMine
                              ? 'ml-auto bg-teal-700 text-white'
                              : 'mr-auto bg-white text-slate-900'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <strong
                          className={`text-sm ${
                            isSystem
                              ? 'text-slate-600'
                              : isPrivate
                                ? 'text-violet-700'
                                : isMine
                                  ? 'text-teal-50'
                                  : 'text-teal-700'
                          }`}
                        >
                          {message.username}
                        </strong>
                        <time
                          className={`text-xs ${
                            isSystem
                              ? 'text-slate-500'
                              : isPrivate
                                ? 'text-violet-500'
                                : isMine
                                  ? 'text-teal-50'
                                  : 'text-slate-400'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </time>
                      </div>
                      <p className="break-words">{message.content}</p>
                    </article>
                  )
                })}
                <div ref={messagesEndRef} aria-hidden="true" />
              </div>
            )}
          </div>

          <form
            className="flex gap-3 border-t border-slate-200 bg-white p-4"
            onSubmit={handleSendMessage}
          >
            <input
              className="min-h-12 flex-1 rounded-lg border border-slate-200 px-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              type="text"
              placeholder={
                selectedChannel
                  ? `Mensaje para #${selectedChannel.name} o /usuarios`
                  : 'Selecciona un canal'
              }
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              disabled={!selectedChannel}
            />
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 font-bold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!selectedChannel || !messageText.trim()}
            >
              <Send size={18} aria-hidden="true" />
              Enviar
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default ServerPage
