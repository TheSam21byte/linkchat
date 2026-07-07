import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Hash,
  LoaderCircle,
  MessageCircle,
} from 'lucide-react'
import AppLogo from '../components/app-logo'
import ThemeToggle from '../components/theme-toggle'
import heroImage from '../assets/hero.png'

function JoinInvitePage({ code, currentUser, onBack, onContinue, onLoadInvite }) {
  const [invite, setInvite] = useState(null)
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

  async function handleContinue() {
    if (!invite) return

    try {
      setIsJoining(true)
      setError('')
      await onContinue(invite)
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setIsJoining(false)
    }
  }

  const serverName = invite?.server?.name ?? 'este servidor'

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 px-5 py-8 text-white">
      <ThemeToggle className="absolute right-5 top-5 z-20" />
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
            Invitación LinkChat
          </div>
          <h1 className="text-4xl font-bold leading-tight max-sm:text-3xl">
            Te estás uniendo a{' '}
            <span className="text-teal-200">{serverName}</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-200">
            Para entrar a este servidor necesitas iniciar sesión o crear una
            cuenta en LinkChat.
          </p>
        </div>

        <div className="rounded-lg border border-white/15 bg-white/95 p-6 text-slate-950 shadow-2xl shadow-black/30 dark:bg-slate-900 dark:text-white">
          <div className="mb-5">
            <div className="mb-4 grid size-12 place-items-center rounded-lg bg-white shadow-lg shadow-teal-950/20">
              {isLoading ? (
                <LoaderCircle className="animate-spin text-teal-700" size={23} />
              ) : (
                <AppLogo imageClassName="size-12" />
              )}
            </div>
            <p className="text-sm font-bold uppercase tracking-normal text-teal-700">
              Acceso por invitación
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {isLoading ? 'Validando invitación' : `Entrar a ${serverName}`}
            </h2>
            {currentUser ? (
              <p className="mt-3 rounded-lg bg-teal-50 p-3 text-sm font-semibold text-teal-800">
                Sesión activa: entrarás como {currentUser.username}.
              </p>
            ) : (
              <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                No has iniciado sesión. Primero ingresa o crea una cuenta.
              </p>
            )}
          </div>

          {error ? (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
              <span>{error}</span>
            </div>
          ) : null}

          <button
            type="button"
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 font-bold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!invite || isLoading || isJoining}
            onClick={handleContinue}
          >
            {isJoining ? (
              <LoaderCircle className="animate-spin" size={20} />
            ) : (
              <MessageCircle size={20} aria-hidden="true" />
            )}
            {currentUser ? 'Unirme al servidor' : 'Iniciar sesión para unirme'}
            <ArrowRight size={18} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 font-semibold text-slate-700 transition hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100"
            onClick={onBack}
          >
            Volver
          </button>
        </div>
      </section>
    </main>
  )
}

export default JoinInvitePage
