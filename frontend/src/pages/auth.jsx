import { useState } from 'react'
import {
  AlertCircle,
  ImagePlus,
  LoaderCircle,
  Lock,
  Mail,
  UserRound,
} from 'lucide-react'
import AppLogo from '../components/app-logo'
import { loginUser, registerUser } from '../services/auth-api'

function AuthPage({ mode = 'login', helperText, onBack, onAuthenticated }) {
  const [authMode, setAuthMode] = useState(mode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRegister = authMode === 'register'

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setError('')
      setMessage('')

      if (isRegister) {
        await registerUser({
          name,
          email,
          password,
          avatar,
        })

        setMessage('Cuenta creada correctamente. Ahora inicia sesión.')
        setAuthMode('login')
        setPassword('')
        return
      }

      const data = await loginUser({
        email,
        password,
      })

      await onAuthenticated(data.user, data.token)
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#ccfbf1,transparent_32%),linear-gradient(135deg,#f8fafc,#eef2ff)] px-5 py-8 text-slate-950">
      <div className="w-full max-w-md rounded-lg border border-white/70 bg-white/90 p-7 text-left shadow-2xl shadow-slate-300/60 backdrop-blur">
        <div className="mb-6">
          <AppLogo className="mb-4" imageClassName="size-12" />
          <p className="mb-2 text-sm font-bold uppercase tracking-normal text-teal-700">
            LinkChat
          </p>
          <h1 className="mb-3 text-3xl font-semibold leading-tight">
            {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </h1>
          <p className="text-slate-600">
            {helperText ??
              (isRegister
                ? 'Regístrate con tu email, contraseña, nombre y avatar opcional.'
                : 'Ingresa con tu email y contraseña para acceder a LinkChat.')}
          </p>
        </div>

        {message ? (
          <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <span>{error}</span>
          </div>
        ) : null}

        <form className="grid gap-3" onSubmit={handleSubmit}>
          {isRegister ? (
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Nombre
              <span className="relative">
                <UserRound
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={19}
                  aria-hidden="true"
                />
                <input
                  className="min-h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-base font-normal outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  type="text"
                  placeholder="Ej: Ian Solorio"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                />
              </span>
            </label>
          ) : null}

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Email
            <span className="relative">
              <Mail
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={19}
                aria-hidden="true"
              />
              <input
                className="min-h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-base font-normal outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </span>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Contraseña
            <span className="relative">
              <Lock
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={19}
                aria-hidden="true"
              />
              <input
                className="min-h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-base font-normal outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
              />
            </span>
          </label>

          {isRegister ? (
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Avatar opcional
              <span className="relative">
                <ImagePlus
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={19}
                  aria-hidden="true"
                />
                <input
                  className="min-h-12 w-full rounded-lg border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-normal outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:font-semibold focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
                />
              </span>
            </label>
          ) : null}

          <button
            type="submit"
            className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 font-bold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoaderCircle className="animate-spin" size={20} /> : null}
            {isRegister ? 'Registrarme' : 'Ingresar'}
          </button>

          <button
            type="button"
            className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-100"
            onClick={() => {
              setError('')
              setMessage('')
              setAuthMode(isRegister ? 'login' : 'register')
            }}
          >
            {isRegister
              ? 'Ya tengo cuenta, iniciar sesión'
              : 'No tengo cuenta, registrarme'}
          </button>

          {onBack ? (
            <button
              type="button"
              className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 font-semibold text-slate-700 transition hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100"
              onClick={onBack}
            >
              Volver
            </button>
          ) : null}
        </form>
      </div>
    </section>
  )
}

export default AuthPage