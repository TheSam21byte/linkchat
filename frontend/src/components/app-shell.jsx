import { useState } from 'react'
import {
  LoaderCircle,
  LogOut,
  Menu,
  Settings,
  TicketPlus,
  X,
} from 'lucide-react'
import { getInvitationByCode, joinInvitation } from '../services/invitations-api'
import { getServerById } from '../services/servers-api'
import AppLogo from './app-logo'
import ThemeToggle from './theme-toggle'
import UserAvatar from './user-avatar'

function getInitials(value = '') {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function normalizeServer(server, role = 'member') {
  return {
    id: server._id ?? server.id,
    name: server.name,
    description: server.description,
    ownerId: server.ownerId,
    role,
  }
}

function AppShell({
  currentUser,
  servers,
  selectedServer,
  onHome,
  onLogout,
  onProfile,
  onServerJoined,
  onServerSelected,
  sidebarHeader,
  sidebarContent,
  mobileTitle,
  children,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [inviteStep, setInviteStep] = useState('closed')
  const [inviteCode, setInviteCode] = useState('')
  const [resolvedInvite, setResolvedInvite] = useState(null)
  const [inviteError, setInviteError] = useState('')
  const [isProcessingInvite, setIsProcessingInvite] = useState(false)

  function closeInviteModal() {
    setInviteStep('closed')
    setInviteCode('')
    setResolvedInvite(null)
    setInviteError('')
    setIsProcessingInvite(false)
  }

  async function handleValidateInvite(event) {
    event.preventDefault()

    const code = inviteCode.trim()
    if (!code) return

    try {
      setIsProcessingInvite(true)
      setInviteError('')

      const data = await getInvitationByCode(code)
      const invitation = data.invitation ?? data

      if (invitation.active === false) {
        throw new Error('Esta invitación ya no está activa.')
      }

      const inviteServer = invitation.serverId ?? invitation.server
      if (!inviteServer) throw new Error('La invitación no tiene un servidor asociado.')

      const server = typeof inviteServer === 'object'
        ? normalizeServer(inviteServer)
        : normalizeServer(await getServerById(inviteServer))

      setResolvedInvite({ code, invitation, server })
      setInviteStep('confirm')
    } catch (currentError) {
      setInviteError(currentError.message)
    } finally {
      setIsProcessingInvite(false)
    }
  }

  async function handleConfirmJoin() {
    if (!resolvedInvite) return

    try {
      setIsProcessingInvite(true)
      setInviteError('')
      const data = await joinInvitation(resolvedInvite.code)
      const server = data.server
        ? normalizeServer(data.server, data.member?.role ?? 'member')
        : resolvedInvite.server

      closeInviteModal()
      onServerJoined(server)
    } catch (currentError) {
      setInviteError(currentError.message)
      setIsProcessingInvite(false)
    }
  }

  function handleHome() {
    setIsSidebarOpen(false)
    onHome()
  }

  function handleServerSelected(server) {
    setIsSidebarOpen(false)
    onServerSelected(server)
  }

  return (
    <main className="h-dvh w-full max-w-full overflow-hidden bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <div className="grid h-dvh w-full max-w-full min-w-0 grid-cols-[72px_minmax(0,280px)_minmax(0,1fr)] overflow-hidden max-md:grid-cols-1 max-md:grid-rows-[56px_minmax(0,1fr)]">
        <header className="col-start-1 row-start-1 flex min-w-0 items-center gap-3 border-b border-white/10 bg-slate-950 px-3 text-white md:hidden">
          <button
            type="button"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 transition hover:bg-white/15"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Abrir navegaciÃ³n"
          >
            <Menu size={21} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-400">LinkChat</p>
            <p className="truncate text-sm font-bold">{mobileTitle ?? selectedServer?.name ?? 'Tus comunidades'}</p>
          </div>
          <UserAvatar user={currentUser} className="size-9 shrink-0" textClassName="text-[10px]" />
        </header>

        {isSidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-[1px] md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Cerrar navegaciÃ³n"
          />
        ) : null}

        <nav className={`flex min-h-0 flex-col items-center gap-3 overflow-hidden border-r border-white/10 bg-slate-950 px-3 py-4 text-white max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40 max-md:w-16 max-md:px-2 ${isSidebarOpen ? 'max-md:flex' : 'max-md:hidden'}`}>
          <button type="button" className="shrink-0" onClick={handleHome} title="Inicio">
            <AppLogo imageClassName="size-11" />
          </button>
          <div className="h-px w-10 shrink-0 bg-white/15" />

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden">
            {servers.map((server) => {
              const isSelected = selectedServer?.id === server.id

              return (
                <button
                  type="button"
                  key={server.id}
                  className={`grid size-11 shrink-0 place-items-center text-xs font-bold transition ${isSelected ? 'rounded-xl bg-teal-400 text-slate-950' : 'rounded-2xl bg-white/10 text-white hover:rounded-xl hover:bg-teal-500 hover:text-slate-950'}`}
                  title={server.name}
                  onClick={() => handleServerSelected(server)}
                >
                  {getInitials(server.name)}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-white/80 transition hover:bg-red-500/20 hover:text-red-200"
            onClick={onLogout}
            title="Cerrar sesión"
          >
            <LogOut size={19} />
          </button>
        </nav>

        <aside className={`relative flex min-h-0 min-w-0 max-w-full flex-col overflow-hidden border-r border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950 max-md:fixed max-md:inset-y-0 max-md:left-16 max-md:z-40 max-md:w-[min(296px,calc(100vw-4rem))] ${isSidebarOpen ? 'max-md:flex' : 'max-md:hidden'}`}>
          <button
            type="button"
            className="absolute right-2 top-2 z-10 grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-white/10 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Cerrar navegaciÃ³n"
          >
            <X size={19} />
          </button>

          <div
            className="min-h-0 min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto"
            onClickCapture={(event) => {
              if (event.target.closest('button')) setIsSidebarOpen(false)
            }}
          >
            {sidebarHeader}
            {sidebarContent}
          </div>

          <div className="flex min-w-0 max-w-full shrink-0 items-center gap-2 overflow-hidden border-t border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-900">
            <UserAvatar user={currentUser} className="size-10 shrink-0" textClassName="text-xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{currentUser.name}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">@{currentUser.username}</p>
            </div>
            <button
              type="button"
              className="grid size-9 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-teal-100 hover:text-teal-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              onClick={() => setInviteStep('code')}
              title="Unirme con código"
              aria-label="Unirme con código"
            >
              <TicketPlus size={18} />
            </button>
            <ThemeToggle className="size-9" />
            <button
              type="button"
              className="grid size-9 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-200 hover:text-teal-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              onClick={onProfile}
              title="Editar perfil"
              aria-label="Editar perfil"
            >
              <Settings size={18} />
            </button>
          </div>
        </aside>

        <section className="min-h-0 min-w-0 overflow-hidden max-md:col-start-1 max-md:row-start-2">
          {children}
        </section>
      </div>

      {inviteStep !== 'closed' ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeInviteModal()
          }}
        >
          <section
            className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-modal-title"
          >
            <button
              type="button"
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              onClick={closeInviteModal}
              aria-label="Cerrar invitación"
            >
              <X size={19} />
            </button>

            {inviteStep === 'code' ? (
              <form onSubmit={handleValidateInvite}>
                <span className="grid size-12 place-items-center rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  <TicketPlus size={23} />
                </span>
                <h2 id="invite-modal-title" className="mt-5 pr-10 text-2xl font-black">
                  Unirme a un servidor
                </h2>
                <p className="mt-2 leading-7 text-slate-600 dark:text-slate-400">
                  Ingresa el código de invitación que recibiste.
                </p>
                <label className="mt-6 grid gap-2 text-sm font-semibold">
                  Código de invitación
                  <input
                    className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-base outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 dark:border-white/10 dark:bg-slate-800 dark:focus:ring-teal-900"
                    value={inviteCode}
                    onChange={(event) => setInviteCode(event.target.value)}
                    placeholder="Ej: a1b2c3d4"
                    autoFocus
                    required
                  />
                </label>
                {inviteError ? (
                  <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                    {inviteError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 font-bold text-white transition hover:bg-teal-800 disabled:bg-slate-400"
                  disabled={!inviteCode.trim() || isProcessingInvite}
                >
                  {isProcessingInvite ? <LoaderCircle className="animate-spin" size={19} /> : null}
                  {isProcessingInvite ? 'Validando…' : 'Validar código'}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-slate-950 text-lg font-black text-white dark:bg-teal-400 dark:text-slate-950">
                  {getInitials(resolvedInvite?.server.name)}
                </span>
                <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-400">
                  Invitación válida
                </p>
                <h2 id="invite-modal-title" className="mt-2 text-2xl font-black">
                  {resolvedInvite?.server.name}
                </h2>
                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">
                  ¿Quieres unirte a este servidor y acceder a sus canales?
                </p>
                {inviteError ? (
                  <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                    {inviteError}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="mx-auto mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-700 px-7 font-bold text-white transition hover:bg-teal-800 disabled:bg-slate-400"
                  onClick={handleConfirmJoin}
                  disabled={isProcessingInvite}
                >
                  {isProcessingInvite ? <LoaderCircle className="animate-spin" size={19} /> : null}
                  {isProcessingInvite ? 'Uniéndote…' : 'Sí, unirme al servidor'}
                </button>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default AppShell
