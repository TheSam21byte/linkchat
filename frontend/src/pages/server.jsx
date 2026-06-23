import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Hash,
  LoaderCircle,
  LogOut,
  MessageCircle,
  Send,
  Server,
} from 'lucide-react'
import {
  getChannelMessages,
  getServerChannels,
  sendChannelMessage,
} from '../services/chat-api'

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
  const [isLoadingChannels, setIsLoadingChannels] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)

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
    if (!selectedChannelId) return

    let isActive = true

    getChannelMessages(selectedChannelId)
      .then((loadedMessages) => {
        if (!isActive) return

        setMessages(loadedMessages)
        setError('')
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages, selectedChannelId])

  async function handleSendMessage(event) {
    event.preventDefault()

    if (!selectedChannel || !messageText.trim()) return

    try {
      setIsSending(true)
      setError('')

      const newMessage = await sendChannelMessage({
        channelId: selectedChannel.id,
        username: currentUser.username,
        content: messageText,
      })

      setMessages((currentMessages) => [...currentMessages, newMessage])
      setMessageText('')
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setIsSending(false)
    }
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
              <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-teal-600 shadow-lg shadow-teal-900/40">
                <Server size={24} aria-hidden="true" />
              </span>
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
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                      isSelected
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
        </aside>

        <section className="flex min-h-screen min-w-0 flex-col bg-slate-50 max-md:min-h-[70vh]">
          <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-normal text-teal-700">
                Canal
              </p>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <Hash size={20} aria-hidden="true" />
                {selectedChannel?.name ?? 'Selecciona un canal'}
              </h2>
            </div>
            <MessageCircle className="text-teal-700" size={24} />
          </header>

          {error ? (
            <div className="m-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
              <span>{error}</span>
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

                  return (
                    <article
                      key={message._id ?? message.id}
                      className={`max-w-[75%] rounded-lg px-4 py-3 shadow-sm ${
                        isMine
                          ? 'ml-auto bg-teal-700 text-white'
                          : 'mr-auto bg-white text-slate-900'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <strong
                          className={`text-sm ${
                            isMine ? 'text-teal-50' : 'text-teal-700'
                          }`}
                        >
                          {message.username}
                        </strong>
                        <time
                          className={`text-xs ${
                            isMine ? 'text-teal-50' : 'text-slate-400'
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
                  ? `Mensaje para #${selectedChannel.name}`
                  : 'Selecciona un canal'
              }
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              disabled={!selectedChannel}
            />
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 font-bold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!selectedChannel || !messageText.trim() || isSending}
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
