import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  LogOut,
  MessageCircle,
  Send,
  Server,
  UserRound,
  UsersRound,
} from 'lucide-react'
import AppLogo from '../components/app-logo'
import {
  getContacts,
  getDirectMessages,
  getUserServers,
  sendDirectMessage,
} from '../services/chat-api'

const statusLabels = {
  online: 'En linea',
  offline: 'Desconectado',
  busy: 'Ocupado',
}

function getInitials(username = '') {
  return username
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function formatTime(date) {
  return new Intl.DateTimeFormat('es', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function ChatHome({ currentUser, onLogout, onServerSelected }) {
  const [contacts, setContacts] = useState([])
  const [servers, setServers] = useState([])
  const [selectedContactId, setSelectedContactId] = useState('')
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.id === selectedContactId),
    [contacts, selectedContactId],
  )

  const visibleMessages = selectedContact ? messages : []

  useEffect(() => {
    let isActive = true

    Promise.all([getContacts(currentUser.id), getUserServers(currentUser.id)])
      .then(([loadedContacts, loadedServers]) => {
        if (!isActive) return

        setContacts(loadedContacts)
        setServers(loadedServers)
        setSelectedContactId(loadedContacts[0]?.id ?? '')
        setError('')
      })
      .catch((currentError) => {
        if (!isActive) return

        setError(currentError.message)
      })
      .finally(() => {
        if (!isActive) return

        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [currentUser.id])

  useEffect(() => {
    if (!selectedContactId) {
      return
    }

    let isActive = true

    getDirectMessages(currentUser.id, selectedContactId)
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
  }, [currentUser.id, selectedContactId])

  async function handleSendMessage(event) {
    event.preventDefault()

    if (!selectedContact || !messageText.trim()) return

    try {
      setIsSending(true)
      setError('')

      const newMessage = await sendDirectMessage({
        fromUserId: currentUser.id,
        toUserId: selectedContact.id,
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
      <div className="grid min-h-screen grid-cols-[76px_280px_1fr] overflow-hidden max-lg:grid-cols-[72px_240px_1fr] max-md:grid-cols-1">
        <aside className="flex flex-col items-center gap-3 border-r border-slate-200 bg-slate-950 px-3 py-4 text-white max-md:hidden">
          <AppLogo imageClassName="size-12" />

          <div className="my-2 h-px w-10 bg-white/15" />

          {servers.length === 0 ? (
            <div className="grid size-12 place-items-center rounded-lg bg-white/10 text-white/60">
              <Server size={20} aria-hidden="true" />
            </div>
          ) : (
            servers.map((server) => (
              <button
                type="button"
                key={server.id}
                className="grid size-12 place-items-center rounded-lg bg-white/10 font-bold text-white transition hover:bg-teal-600"
                title={server.name}
                onClick={() => onServerSelected(server)}
              >
                {getInitials(server.name)}
              </button>
            ))
          )}

          <button
            type="button"
            className="mt-auto grid size-11 place-items-center rounded-lg bg-white/10 text-white/80 transition hover:bg-white/20"
            onClick={onLogout}
            title="Salir"
          >
            <LogOut size={20} aria-hidden="true" />
          </button>
        </aside>

        <aside className="border-r border-slate-200 bg-white max-md:border-r-0">
          <div className="border-b border-slate-200 p-4">
            <AppLogo
              showLabel
              className="mb-4"
              imageClassName="size-10"
              labelClassName="text-lg text-slate-950"
            />
            <p className="text-xs font-bold uppercase tracking-normal text-teal-700">
              Sesion activa
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-slate-900 font-bold text-white">
                {getInitials(currentUser.username)}
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold">
                  {currentUser.username}
                </h1>
                <p className="text-sm text-teal-700">
                  {statusLabels[currentUser.status] ?? currentUser.status}
                </p>
              </div>
            </div>
          </div>

          <section className="border-b border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
              <Server size={18} aria-hidden="true" />
              Servidores
            </div>
            <div className="grid gap-2">
              {servers.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                  No perteneces a servidores.
                </p>
              ) : (
                servers.map((server) => (
                  <button
                    type="button"
                    key={server.id}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-teal-300 hover:bg-teal-50"
                    onClick={() => onServerSelected(server)}
                  >
                    <p className="font-semibold">{server.name}</p>
                    <p className="text-sm text-slate-500">{server.role}</p>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
              <UsersRound size={18} aria-hidden="true" />
              Contactos
            </div>

            {isLoading ? (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                Cargando contactos...
              </p>
            ) : null}

            {!isLoading && contacts.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                No hay otros usuarios disponibles.
              </p>
            ) : null}

            <div className="grid gap-2">
              {contacts.map((contact) => {
                const isSelected = contact.id === selectedContactId

                return (
                  <button
                    type="button"
                    key={contact.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition hover:border-teal-300 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-slate-200 bg-white'
                    }`}
                    onClick={() => setSelectedContactId(contact.id)}
                  >
                    <span className="grid size-10 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">
                      {getInitials(contact.username) || (
                        <UserRound size={18} aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <strong className="block truncate">
                        {contact.username}
                      </strong>
                      <small className="text-slate-500">
                        {statusLabels[contact.status] ?? contact.status}
                      </small>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        </aside>

        <section className="flex min-h-screen flex-col bg-slate-50 max-md:min-h-[70vh]">
          <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-normal text-teal-700">
                Chat directo
              </p>
              <h2 className="text-xl font-semibold">
                {selectedContact?.username ?? 'Selecciona un contacto'}
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

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {!selectedContact ? (
              <div className="grid h-full place-items-center text-center text-slate-500">
                <p>Selecciona un contacto para empezar a conversar.</p>
              </div>
            ) : visibleMessages.length === 0 ? (
              <div className="grid h-full place-items-center text-center text-slate-500">
                <p>No hay mensajes todavia con {selectedContact.username}.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {visibleMessages.map((message) => {
                  const fromId =
                    message.fromUserId?._id ?? message.fromUserId?.id
                  const isMine = fromId === currentUser.id

                  return (
                    <article
                      key={message._id ?? message.id}
                      className={`max-w-[75%] rounded-lg px-4 py-3 shadow-sm ${
                        isMine
                          ? 'ml-auto bg-teal-700 text-white'
                          : 'mr-auto bg-white text-slate-900'
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                      <time
                        className={`mt-2 block text-xs ${
                          isMine ? 'text-teal-50' : 'text-slate-400'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </time>
                    </article>
                  )
                })}
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
                selectedContact
                  ? `Mensaje para ${selectedContact.username}`
                  : 'Selecciona un contacto'
              }
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              disabled={!selectedContact}
            />
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 font-bold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!selectedContact || !messageText.trim() || isSending}
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

export default ChatHome
