import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Check,
  Circle,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  UserRound,
} from 'lucide-react'
import { getUsers, startUser } from '../services/users-api'

const statusLabels = {
  online: 'En linea',
  offline: 'Desconectado',
  busy: 'Ocupado',
}

function getInitials(username) {
  return username
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function normalizeUsers(databaseUsers) {
  return databaseUsers.map((user) => ({
    id: user._id ?? user.id,
    username: user.username,
    status: user.status,
  }))
}

function SelectUser({ onUserSelected }) {
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState('')

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId),
    [selectedUserId, users],
  )

  async function loadUsers() {
    try {
      setIsLoading(true)
      setError('')

      const databaseUsers = await getUsers()
      const normalizedUsers = normalizeUsers(databaseUsers)

      setUsers(normalizedUsers)
      setSelectedUserId((currentId) => {
        if (normalizedUsers.some((user) => user.id === currentId)) {
          return currentId
        }

        return normalizedUsers[0]?.id ?? ''
      })
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleStartUser() {
    if (!selectedUser) return

    try {
      setIsStarting(true)
      setError('')

      const startedUser = await startUser(selectedUser.username)

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === startedUser.id
            ? { ...user, status: startedUser.status }
            : user,
        ),
      )
      onUserSelected(startedUser)
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setIsStarting(false)
    }
  }

  useEffect(() => {
    let isActive = true

    getUsers()
      .then((databaseUsers) => {
        if (!isActive) return

        const normalizedUsers = normalizeUsers(databaseUsers)

        setUsers(normalizedUsers)
        setSelectedUserId(normalizedUsers[0]?.id ?? '')
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
  }, [])

  return (
    <section className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#ccfbf1,transparent_32%),linear-gradient(135deg,#f8fafc,#eef2ff)] px-5 py-8 text-slate-950">
      <div className="w-full max-w-md rounded-lg border border-white/70 bg-white/90 p-7 text-left shadow-2xl shadow-slate-300/60 backdrop-blur">
        <div className="mb-6">
          <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-teal-700 text-white shadow-lg shadow-teal-700/20">
            <MessageCircle size={24} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <p className="mb-2 text-sm font-bold uppercase tracking-normal text-teal-700">
            LinkChat
          </p>
          <h1 className="mb-3 text-3xl font-semibold leading-tight">
            Selecciona tu usuario
          </h1>
          <p className="text-slate-600">
            Elige un usuario registrado en la base de datos para entrar al chat.
          </p>
        </div>

        {error ? (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="mb-6 grid gap-3" aria-label="Usuarios disponibles">
          {isLoading ? (
            <div className="flex min-h-28 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
              <LoaderCircle className="mr-2 animate-spin" size={20} />
              Cargando usuarios...
            </div>
          ) : null}

          {!isLoading && users.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-center text-slate-600">
              No hay usuarios registrados en la base de datos.
            </div>
          ) : null}

          {!isLoading &&
            users.map((user) => {
              const isSelected = user.id === selectedUserId
              const isOnline = user.status === 'online'

              return (
                <button
                  type="button"
                  key={user.id}
                  className={`grid min-h-20 w-full grid-cols-[48px_1fr_34px] items-center gap-4 rounded-lg border p-3 text-left transition hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-teal-100 ${
                    isSelected
                      ? 'border-teal-700 bg-teal-50 shadow-md shadow-teal-100'
                      : 'border-slate-200 bg-white'
                  }`}
                  onClick={() => setSelectedUserId(user.id)}
                  aria-pressed={isSelected}
                >
                  <span className="relative grid size-12 place-items-center rounded-full bg-slate-900 font-bold text-white">
                    <UserRound size={20} aria-hidden="true" />
                    <span className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-teal-600 px-1 text-[10px] leading-4">
                      {getInitials(user.username)}
                    </span>
                  </span>
                  <span className="grid min-w-0 gap-1">
                    <strong className="break-words text-slate-950">
                      {user.username}
                    </strong>
                    <small
                      className={`break-words text-sm ${
                        isOnline ? 'text-teal-700' : 'text-slate-600'
                      }`}
                    >
                      {statusLabels[user.status] ?? user.status}
                    </small>
                  </span>
                  <span
                    className={`grid size-8 place-items-center rounded-full text-sm font-bold ${
                      isSelected
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 text-slate-300'
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected ? <Check size={18} /> : <Circle size={14} />}
                  </span>
                </button>
              )
            })}
        </div>

        <div className="grid gap-3">
          <button
            type="button"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 font-bold text-white transition hover:-translate-y-0.5 hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:translate-y-0"
            onClick={handleStartUser}
            disabled={!selectedUser || isStarting}
          >
            {isStarting ? (
              <LoaderCircle className="animate-spin" size={20} />
            ) : (
              <MessageCircle size={20} aria-hidden="true" />
            )}
            {selectedUser
              ? `Entrar como ${selectedUser.username}`
              : 'Selecciona un usuario'}
          </button>

          <button
            type="button"
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-100"
            onClick={loadUsers}
          >
            <RefreshCw size={18} aria-hidden="true" />
            Actualizar usuarios
          </button>
        </div>
      </div>
    </section>
  )
}

export default SelectUser
