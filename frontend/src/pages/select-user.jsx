import { useState } from 'react'
import { AlertCircle, LoaderCircle, MessageCircle, UserRound } from 'lucide-react'
import { startUser } from '../services/users-api'

function SelectUser({ helperText, onBack, onUserSelected }) {
  const [username, setUsername] = useState('')
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState('')

  async function handleStartUser(event) {
    event.preventDefault()

    const cleanUsername = username.trim()

    if (cleanUsername.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres')
      return
    }

    try {
      setIsStarting(true)
      setError('')

      const startedUser = await startUser(cleanUsername)

      await onUserSelected(startedUser)
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setIsStarting(false)
    }
  }

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
            Ingresa tu usuario
          </h1>
          <p className="text-slate-600">
            {helperText ??
              'Escribe tu username. Si ya existe, entraras con esa cuenta; si no existe, LinkChat la creara automaticamente.'}
          </p>
        </div>

        {error ? (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <span>{error}</span>
          </div>
        ) : null}

        <form className="grid gap-3" onSubmit={handleStartUser}>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Username
            <span className="relative">
              <UserRound
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={19}
                aria-hidden="true"
              />
              <input
                className="min-h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-base font-normal outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                type="text"
                placeholder="Ej: samuel"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                autoFocus
              />
            </span>
          </label>

          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 font-bold text-white transition hover:-translate-y-0.5 hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:translate-y-0"
            disabled={username.trim().length < 3 || isStarting}
          >
            {isStarting ? (
              <LoaderCircle className="animate-spin" size={20} />
            ) : (
              <MessageCircle size={20} aria-hidden="true" />
            )}
            Entrar a LinkChat
          </button>

          {onBack ? (
            <button
              type="button"
              className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 font-semibold text-slate-700 transition hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100"
              onClick={onBack}
            >
              Volver a la presentacion
            </button>
          ) : null}
        </form>
      </div>
    </section>
  )
}

export default SelectUser
