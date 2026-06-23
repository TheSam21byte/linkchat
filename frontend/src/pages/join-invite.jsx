import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Hash,
  LoaderCircle,
  MessageCircle,
  UserRound,
} from 'lucide-react'
import AppLogo from '../components/app-logo'
import heroImage from '../assets/hero.png'

function JoinInvitePage({ code, onBack, onJoin, onLoadInvite }) {
  const [invite, setInvite] = useState(null)
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    let isActive = true

    onLoadInvite(code)
      .then((loadedInvite) => {
        if (!isActive) return

        setInvite(loadedInvite)
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
  }, [code, onLoadInvite])

  async function handleJoin(event) {
    event.preventDefault()

    const cleanUsername = username.trim()

    if (cleanUsername.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres')
      return
    }

    try {
      setIsJoining(true)
      setError('')
      await onJoin(invite, cleanUsername)
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setIsJoining(false)
    }
  }

  const serverName = invite?.server?.name ?? 'este servidor'

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 px-5 py-8 text-white">
      <img
        src={heroImage}
        alt=""
        className="absolute inset-0 size-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-slate-950/75" />

      <section className="relative z-10 grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="self-center">
          <AppLogo
            showLabel
            className="mb-5"
            imageClassName="size-14"
            labelClassName="text-3xl text-white"
          />
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-teal-100 backdrop-blur">
            <Hash size={16} aria-hidden="true" />
            Invitacion LinkChat
          </div>
          <h1 className="text-4xl font-bold leading-tight max-sm:text-3xl">
            Te estas uniendo a <span className="text-teal-200">{serverName}</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-200">
            Ingresa tu nombre de usuario para entrar. Si ya existe, LinkChat
            usara tu cuenta; si no existe, la creara automaticamente.
          </p>
        </div>

        <form
          className="rounded-lg border border-white/15 bg-white/95 p-6 text-slate-950 shadow-2xl shadow-black/30"
          onSubmit={handleJoin}
        >
          <div className="mb-5">
            <div className="mb-4 grid size-12 place-items-center rounded-lg bg-white shadow-lg shadow-teal-950/20">
              {isLoading ? (
                <LoaderCircle className="animate-spin text-teal-700" size={23} />
              ) : (
                <AppLogo imageClassName="size-12" />
              )}
            </div>
            <p className="text-sm font-bold uppercase tracking-normal text-teal-700">
              Acceso por invitacion
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {isLoading ? 'Validando invitacion' : `Entrar a ${serverName}`}
            </h2>
          </div>

          {error ? (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
              <span>{error}</span>
            </div>
          ) : null}

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
                disabled={isLoading}
              />
            </span>
          </label>

          <button
            type="submit"
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 font-bold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!invite || username.trim().length < 3 || isJoining}
          >
            {isJoining ? (
              <LoaderCircle className="animate-spin" size={20} />
            ) : (
              <MessageCircle size={20} aria-hidden="true" />
            )}
            Unirme al servidor
            <ArrowRight size={18} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 font-semibold text-slate-700 transition hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100"
            onClick={onBack}
          >
            Volver a la presentacion
          </button>
        </form>
      </section>
    </main>
  )
}

export default JoinInvitePage
