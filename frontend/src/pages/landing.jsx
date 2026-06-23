import { useState } from 'react'
import {
  ArrowRight,
  MessageCircle,
  Radio,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import AppLogo from '../components/app-logo'
import heroImage from '../assets/hero.png'

function LandingPage({ currentUser, onJoinInvite }) {
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  async function handleJoinInvite(event) {
    event.preventDefault()

    const cleanCode = inviteCode.trim()

    if (!cleanCode) return

    try {
      setIsJoining(true)
      setError('')
      await onJoinInvite(cleanCode)
      setInviteCode('')
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative flex min-h-[92vh] overflow-hidden">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-slate-950/70" />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl content-center gap-10 px-5 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-teal-100 backdrop-blur">
              <Radio size={16} aria-hidden="true" />
              Chat en tiempo real para equipos pequenos
            </div>

            <AppLogo
              showLabel
              className="mb-5"
              imageClassName="size-16"
              labelClassName="text-5xl leading-tight text-white max-md:text-4xl"
            />
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              Una experiencia tipo mini-Discord para entrar a servidores,
              participar en canales y conversar al instante con tu comunidad.
            </p>

            <p className="mt-8 max-w-xl rounded-lg border border-white/10 bg-white/10 p-4 text-sm leading-6 text-slate-200 backdrop-blur">
              El acceso al chat se realiza mediante un codigo de invitacion.
              Pega tu codigo para entrar directamente al servidor y sus canales.
            </p>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3 max-sm:grid-cols-1">
              <div className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                <MessageCircle className="mb-3 text-teal-200" size={22} />
                <p className="font-bold">Canales vivos</p>
                <p className="mt-1 text-sm text-slate-300">Mensajes al momento.</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                <UsersRound className="mb-3 text-teal-200" size={22} />
                <p className="font-bold">Servidores</p>
                <p className="mt-1 text-sm text-slate-300">Espacios por equipo.</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                <ShieldCheck className="mb-3 text-teal-200" size={22} />
                <p className="font-bold">Invitaciones</p>
                <p className="mt-1 text-sm text-slate-300">Acceso por codigo.</p>
              </div>
            </div>
          </div>

          <form
            className="self-center rounded-lg border border-white/15 bg-white/95 p-6 text-slate-950 shadow-2xl shadow-black/30"
            onSubmit={handleJoinInvite}
          >
            <div className="mb-5">
              <AppLogo className="mb-4" imageClassName="size-12" />
              <p className="text-sm font-bold uppercase tracking-normal text-teal-700">
                Invitacion directa
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Ingresa a un canal
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Pega el codigo de invitacion. LinkChat validara el servidor y
                abrira automaticamente el primer canal disponible.
              </p>
            </div>

            {currentUser ? (
              <p className="mb-3 rounded-lg bg-teal-50 p-3 text-sm font-semibold text-teal-800">
                Sesion recordada: entraras como {currentUser.username}.
              </p>
            ) : null}

            {error ? (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Codigo de invitacion
              <input
                className="min-h-12 rounded-lg border border-slate-200 px-4 text-base font-normal outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                type="text"
                placeholder="Ej: a1b2c3d4"
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value)}
              />
            </label>

            <button
              type="submit"
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!inviteCode.trim() || isJoining}
            >
              {isJoining ? 'Validando...' : 'Ingresar con codigo'}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-8 text-slate-200 md:grid-cols-3">
        <p className="text-sm leading-6">
          Backend Express para usuarios, servidores, canales e invitaciones.
        </p>
        <p className="text-sm leading-6">
          Socket.IO mantiene los canales activos con mensajes en tiempo real.
        </p>
        <p className="text-sm leading-6">
          MongoDB Atlas conserva usuarios, servidores, membresias y mensajes.
        </p>
      </section>
    </main>
  )
}

export default LandingPage
