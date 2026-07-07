import { useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  AtSign,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Lock,
  Mail,
  UserRound,
} from 'lucide-react'
import AppLogo from '../components/app-logo'
import ThemeToggle from '../components/theme-toggle'
import { loginUser, registerUser } from '../services/auth-api'

const inputClassName =
  'min-h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-base font-normal outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 dark:border-white/10 dark:bg-slate-800 dark:text-white dark:focus:ring-teal-900'

function AuthPage({
  mode = 'login',
  helperText,
  notice,
  onBack,
  onAuthenticated,
  onRegistered,
  onSwitchMode,
}) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRegister = mode === 'register'

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setError('')

      if (isRegister) {
        await registerUser({ name, username, email, password, avatar })
        onRegistered()
        return
      }

      const data = await loginUser({ email, password })
      await onAuthenticated(data.user, data.token)
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-950">
      <ThemeToggle className="absolute right-5 top-5 z-20" />
      <div className="absolute -left-32 top-20 size-96 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="absolute -right-20 bottom-0 size-[30rem] rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-12 px-5 py-10 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="hidden text-white lg:block">
          <AppLogo
            showLabel
            className="mb-10"
            imageClassName="size-14"
            labelClassName="text-3xl"
          />
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-teal-300">
            Tu comunidad, siempre cerca
          </p>
          <h1 className="max-w-lg text-5xl font-bold leading-[1.08]">
            Conversaciones que encuentran su lugar.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Reúne a tus amigos y equipos en servidores, organiza cada tema en
            canales y conversa en tiempo real.
          </p>
          <div className="mt-10 grid gap-4 text-sm text-slate-200">
            {['Canales organizados', 'Invitaciones privadas', 'Mensajes en tiempo real'].map(
              (feature) => (
                <p key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="text-teal-300" size={19} />
                  {feature}
                </p>
              ),
            )}
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl rounded-3xl border border-white/70 bg-white p-6 shadow-2xl shadow-black/30 dark:border-white/10 dark:bg-slate-900 dark:text-white sm:p-9">
          <button
            type="button"
            className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            onClick={onBack}
          >
            <ArrowLeft size={17} />
            Volver al inicio
          </button>

          <AppLogo className="mb-5 lg:hidden" imageClassName="size-11" />
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-teal-700">
            {isRegister ? 'Crea tu identidad' : 'Te damos la bienvenida'}
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            {isRegister ? 'Crear una cuenta' : 'Iniciar sesión'}
          </h2>
          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">
            {helperText ??
              (isRegister
                ? 'Completa tus datos para comenzar a explorar LinkChat.'
                : 'Ingresa con el correo y la contraseña de tu cuenta.')}
          </p>

          {notice ? (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-800">
              <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
              <span>{notice}</span>
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
              <span>{error}</span>
            </div>
          ) : null}

          <form className="mt-7 grid gap-4 [&_label]:dark:text-slate-200" onSubmit={handleSubmit}>
            {isRegister ? (
              <>
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Nombre completo
                  <span className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                    <input
                      className={inputClassName}
                      type="text"
                      placeholder="Ej: Andrea Ramírez"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      minLength={3}
                      required
                    />
                  </span>
                </label>

                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Username
                  <span className="relative">
                    <AtSign className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                    <input
                      className={inputClassName}
                      type="text"
                      placeholder="Ej: andrea_dev"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      autoComplete="username"
                      minLength={3}
                      required
                    />
                  </span>
                  <span className="font-normal leading-5 text-slate-500">
                    Este es tu nombre de usuario público. Todos podrán verlo en
                    servidores, canales y conversaciones.
                  </span>
                </label>
              </>
            ) : null}

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Correo electrónico
              <span className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                <input
                  className={inputClassName}
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
                <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                <input
                  className={inputClassName}
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  minLength={6}
                  required
                />
              </span>
            </label>

            {isRegister ? (
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Avatar <span className="font-normal text-slate-400">(opcional)</span>
                <span className="relative">
                  <ImagePlus className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                  <input
                    className="min-h-12 w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-normal outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:font-semibold focus:border-teal-500 focus:ring-4 focus:ring-teal-100 dark:border-white/10 dark:bg-slate-800 dark:file:bg-slate-700"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
                  />
                </span>
              </label>
            ) : null}

            <button
              type="submit"
              className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 font-bold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? <LoaderCircle className="animate-spin" size={20} /> : null}
              {isRegister ? 'Crear mi cuenta' : 'Ingresar a LinkChat'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            {isRegister ? '¿Ya tienes una cuenta?' : '¿Aún no tienes una cuenta?'}{' '}
            <button
              type="button"
              className="font-bold text-teal-700 hover:text-teal-900 hover:underline"
              onClick={() => onSwitchMode(isRegister ? 'login' : 'register')}
            >
              {isRegister ? 'Inicia sesión acá' : 'Regístrate acá'}
            </button>
          </p>
        </section>
      </div>
    </main>
  )
}

export default AuthPage
