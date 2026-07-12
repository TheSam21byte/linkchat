import { useState } from 'react'
import {
  ArrowRight,
  Check,
  Hash,
  LockKeyhole,
  MessageCircle,
  Radio,
  Send,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import AppLogo from '../components/app-logo'
import ThemeToggle from '../components/theme-toggle'

const features = [
  {
    icon: Hash,
    title: 'Canales organizados',
    description:
      'Separa conversaciones por proyectos, intereses o temas para que todo sea fácil de encontrar.',
  },
  {
    icon: Radio,
    title: 'Conversaciones en tiempo real',
    description:
      'Comparte ideas y recibe mensajes al instante con una experiencia rápida y natural.',
  },
  {
    icon: UsersRound,
    title: 'Comunidades a tu manera',
    description:
      'Crea servidores para tus equipos, amigos o comunidades y reúne a todos en un mismo lugar.',
  },
  {
    icon: LockKeyhole,
    title: 'Acceso por invitación',
    description:
      'Decide quién entra compartiendo códigos de invitación directos para cada comunidad.',
  },
]

function LandingPage({ currentUser, onJoinInvite, onLogin, onRegister, onEnterApp }) {
  const [inviteCode, setInviteCode] = useState('')

  function handleJoinInvite(event) {
    event.preventDefault()

    const cleanCode = inviteCode.trim()
    if (!cleanCode) return

    onJoinInvite(cleanCode)
  }

  return (
    <main className="overflow-hidden bg-slate-950 text-white">
      <section className="relative min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(20,184,166,0.25),transparent_27%),radial-gradient(circle_at_85%_35%,rgba(99,102,241,0.22),transparent_30%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300/60 to-transparent" />

        <nav className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <AppLogo
            showLabel
            imageClassName="size-10"
            labelClassName="text-xl text-white"
          />
          <div className="hidden items-center gap-8 text-sm font-semibold text-slate-300 md:flex">
            <a className="transition hover:text-white" href="#caracteristicas">
              Características
            </a>
            <a className="transition hover:text-white" href="#como-funciona">
              Cómo funciona
            </a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {currentUser ? (
              <button
                type="button"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-50"
                onClick={onEnterApp}
              >
                Abrir LinkChat
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 sm:block"
                  onClick={onLogin}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-50"
                  onClick={onRegister}
                >
                  Crear cuenta
                </button>
              </>
            )}
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-82px)] w-full max-w-7xl items-center gap-14 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-4 py-2 text-sm font-semibold text-teal-200">
              <Sparkles size={16} />
              Un espacio para hablar, compartir y pertenecer
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Donde tus comunidades{' '}
              <span className="bg-gradient-to-r from-teal-300 to-indigo-300 bg-clip-text text-transparent">
                cobran vida.
              </span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              LinkChat reúne a tus amigos, equipos y comunidades en servidores
              con canales organizados y conversaciones en tiempo real.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-teal-400"
                onClick={currentUser ? onEnterApp : onRegister}
              >
                {currentUser ? 'Entrar a mi cuenta' : 'Ingresar username'}
                <ArrowRight size={19} />
              </button>
              {!currentUser ? (
                <button
                  type="button"
                  className="inline-flex min-h-13 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 font-bold text-white transition hover:bg-white/10"
                  onClick={onLogin}
                >
                  Ya tengo una cuenta
                </button>
              ) : null}
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
              {['Registro sencillo', 'Canales en vivo', 'Invitaciones directas'].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="text-teal-300" size={16} /> {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-teal-400/20 to-indigo-500/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl shadow-black/50 backdrop-blur">
              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
                <span className="size-2.5 rounded-full bg-red-400" />
                <span className="size-2.5 rounded-full bg-amber-300" />
                <span className="size-2.5 rounded-full bg-teal-400" />
                <span className="ml-3 text-xs font-semibold text-slate-400">
                  Comunidad LinkChat
                </span>
              </div>
              <div className="grid min-h-[390px] grid-cols-[72px_150px_1fr] sm:grid-cols-[76px_180px_1fr]">
                <div className="border-r border-white/10 bg-slate-950/80 p-3">
                  {[0, 1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className={`mb-3 grid size-11 place-items-center rounded-2xl ${item === 0 ? 'bg-teal-500 text-slate-950' : 'bg-white/10 text-slate-400'}`}
                    >
                      {item === 0 ? <MessageCircle size={20} /> : <span className="text-xs font-bold">LC</span>}
                    </div>
                  ))}
                </div>
                <div className="border-r border-white/10 bg-slate-900 p-4">
                  <p className="mb-5 text-sm font-bold">LinkChat</p>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Canales
                  </p>
                  {['general', 'proyectos', 'ideas', 'random'].map((channel, index) => (
                    <p
                      key={channel}
                      className={`mb-1.5 flex items-center gap-2 rounded-lg px-2 py-2 text-sm ${index === 0 ? 'bg-white/10 text-white' : 'text-slate-400'}`}
                    >
                      <Hash size={15} /> {channel}
                    </p>
                  ))}
                </div>
                <div className="flex min-w-0 flex-col bg-slate-800/70">
                  <div className="border-b border-white/10 px-4 py-4 text-sm font-bold">
                    # general
                  </div>
                  <div className="flex-1 space-y-5 p-4">
                    {[
                      ['AR', 'Andrea', '¡Bienvenidos al nuevo espacio!'],
                      ['JM', 'Juan', 'Se ve increíble. ¿Comenzamos?'],
                      ['LC', 'Laura', 'Ya compartí la invitación ✨'],
                    ].map(([initials, username, message], index) => (
                      <div key={username} className="flex gap-3">
                        <span className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold ${index === 0 ? 'bg-teal-400 text-slate-950' : 'bg-indigo-400 text-white'}`}>
                          {initials}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold">{username}</p>
                          <p className="mt-1 truncate text-sm text-slate-300">{message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="m-3 flex items-center justify-between rounded-xl bg-slate-700/80 px-4 py-3 text-xs text-slate-400">
                    Mensaje para #general
                    <Send size={15} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="caracteristicas" className="bg-slate-50 px-5 py-24 text-slate-950 dark:bg-slate-900 dark:text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
              Todo en un mismo lugar
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Hecho para conversar sin ruido
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">
              Las herramientas esenciales para que cada comunidad mantenga sus
              conversaciones claras, activas y cerca de su gente.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-950"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <Icon size={23} />
                </span>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-white px-5 py-24 text-slate-950 dark:bg-slate-950 dark:text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">
              Entra en segundos
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              ¿Tienes una invitación?
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              Escribe el código, revisa la comunidad a la que te invitaron e
              inicia sesión para unirte. Así de sencillo.
            </p>
            <div className="mt-8 grid gap-5">
              {[
                ['01', 'Ingresa tu código de invitación'],
                ['02', 'Inicia sesión o crea una cuenta'],
                ['03', 'Únete al servidor y comienza a conversar'],
              ].map(([number, text]) => (
                <div key={number} className="flex items-center gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white">
                    {number}
                  </span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <form
            className="rounded-3xl bg-slate-950 p-7 text-white shadow-2xl shadow-slate-300 sm:p-10"
            onSubmit={handleJoinInvite}
          >
            <span className="grid size-12 place-items-center rounded-xl bg-teal-400 text-slate-950">
              <Hash size={24} />
            </span>
            <h3 className="mt-6 text-3xl font-bold">Ingresa directamente</h3>
            <p className="mt-3 leading-7 text-slate-300">
              Usa el código que recibiste para abrir la invitación a tu nueva
              comunidad.
            </p>
            {currentUser ? (
              <p className="mt-5 rounded-xl border border-teal-300/20 bg-teal-300/10 p-3 text-sm text-teal-100">
                Sesión activa: entrarás como <strong>@{currentUser.username}</strong>.
              </p>
            ) : null}
            <label className="mt-7 grid gap-2 text-sm font-semibold text-slate-200">
              Código de invitación
              <input
                className="min-h-13 rounded-xl border border-white/15 bg-white/10 px-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10"
                type="text"
                placeholder="Ej: a1b2c3d4"
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value)}
                required
              />
            </label>
            <button
              type="submit"
              className="mt-4 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-teal-400 px-5 font-bold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:bg-slate-600"
              disabled={!inviteCode.trim()}
            >
              Continuar con el código
              <ArrowRight size={19} />
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-slate-950 px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
          <AppLogo
            showLabel
            imageClassName="size-9"
            labelClassName="text-lg text-white"
          />
          <p className="text-sm text-slate-500">
            Comunidades, canales y conversaciones en tiempo real.
          </p>
        </div>
      </footer>
    </main>
  )
}

export default LandingPage
