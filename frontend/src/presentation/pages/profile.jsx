import { useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  AtSign,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  LogOut,
  Mail,
  Save,
  UserRound,
} from 'lucide-react'
import AppLogo from '../components/app-logo'
import ThemeToggle from '../components/theme-toggle'
import UserAvatar from '../components/user-avatar'
import { updateProfileUseCase } from "../composition/container.js";

const inputClassName =
  'min-h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 dark:border-white/10 dark:bg-slate-800 dark:text-white dark:focus:ring-teal-900'

function ProfilePage({ currentUser, onBack, onLogout, onSaved }) {
  const [name, setName] = useState(currentUser.name ?? '')
  const [username, setUsername] = useState(currentUser.username ?? '')
  const [email, setEmail] = useState(currentUser.email ?? '')
  const [avatar, setAvatar] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const avatarInputRef = useRef(null)

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setIsSaving(true)
      setError('')
      setMessage('')
      const user = await updateProfileUseCase.execute({ name, username, email, avatar })
      onSaved(user)
      setUsername(user.username)
      setAvatar(null)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
      setMessage('Tus datos se actualizaron correctamente.')
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <div className="grid min-h-screen grid-cols-[280px_1fr] max-md:grid-cols-1">
        <aside className="flex flex-col bg-slate-950 p-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <AppLogo
              showLabel
              imageClassName="size-11"
              labelClassName="text-xl"
            />
            <ThemeToggle />
          </div>

          <button
            type="button"
            className="mt-10 flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-left font-semibold transition hover:bg-white/15"
            onClick={onBack}
          >
            <ArrowLeft size={19} /> Volver a la aplicación
          </button>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
            <UserAvatar user={currentUser} className="size-16" />
            <p className="mt-4 truncate font-bold">{currentUser.name}</p>
            <p className="mt-1 truncate text-sm text-slate-400">@{currentUser.username}</p>
          </div>

          <button
            type="button"
            className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
            onClick={onLogout}
          >
            <LogOut size={19} /> Cerrar sesión
          </button>
        </aside>

        <section className="px-5 py-12 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-teal-700 dark:text-teal-400">
              Configuración de cuenta
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Editar perfil</h1>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600 dark:text-slate-400">
              Actualiza la información con la que te identificas dentro de
              LinkChat. Tu email y username no pueden pertenecer a otra cuenta.
            </p>

            <form
              className="mt-9 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-950 sm:p-9"
              onSubmit={handleSubmit}
            >
              {message ? (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-200">
                  <CheckCircle2 className="mt-0.5 shrink-0" size={18} /> {message}
                </div>
              ) : null}
              {error ? (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                  <AlertCircle className="mt-0.5 shrink-0" size={18} /> {error}
                </div>
              ) : null}

              <div className="grid gap-5">
                <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Foto de perfil
                  <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900 sm:flex-row sm:items-center">
                    <UserAvatar user={currentUser} className="size-16 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="relative block">
                        <ImagePlus className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                        <input
                          ref={avatarInputRef}
                          className="min-h-12 w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-normal outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:font-semibold dark:border-white/10 dark:bg-slate-800 dark:file:bg-slate-700"
                          type="file"
                          accept="image/*"
                          onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
                        />
                      </span>
                      <span className="mt-2 block font-normal text-slate-500 dark:text-slate-400">
                        JPG, PNG o WebP. Máximo 2 MB.
                        {avatar ? ` Seleccionada: ${avatar.name}` : ''}
                      </span>
                    </div>
                  </div>
                </label>

                <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Nombre completo
                  <span className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                    <input
                      className={inputClassName}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      minLength={3}
                      required
                    />
                  </span>
                  <span className="font-normal text-slate-500 dark:text-slate-400">Tu nombre personal; no tiene que ser igual al username.</span>
                </label>

                <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Username público
                  <span className="relative">
                    <AtSign className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                    <input
                      className={inputClassName}
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      minLength={3}
                      required
                    />
                  </span>
                  <span className="font-normal text-slate-500 dark:text-slate-400">Es único y visible para los demás usuarios.</span>
                </label>

                <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Correo electrónico
                  <span className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                    <input
                      className={inputClassName}
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </span>
                  <span className="font-normal text-slate-500 dark:text-slate-400">También debe ser único dentro de LinkChat.</span>
                </label>
              </div>

              <button
                type="submit"
                className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
                disabled={isSaving}
              >
                {isSaving ? <LoaderCircle className="animate-spin" size={19} /> : <Save size={19} />}
                {isSaving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}

export default ProfilePage
