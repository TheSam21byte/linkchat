import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Compass,
  LoaderCircle,
  Server,
  UsersRound,
} from 'lucide-react'
import AppShell from '../components/app-shell'
import AppLogo from '../components/app-logo'
import { getMyServersUseCase, joinServerUseCase } from "../composition/container.js";
import { getServersUseCase } from "../composition/container.js";
import ChatHome from './chat-home'

function getInitials(value = '') {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function LoadingApp() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
      <div className="text-center">
        <AppLogo imageClassName="size-14" />
        <LoaderCircle className="mx-auto mt-6 animate-spin text-teal-300" size={28} />
        <p className="mt-3 text-sm text-slate-400">Preparando tu espacio…</p>
      </div>
    </main>
  )
}

function WelcomeServers({
  currentUser,
  servers,
  error,
  joiningServerId,
  onJoin,
  onLogout,
  onProfile,
  onServerJoined,
}) {
  const sidebarHeader = (
    <div className="border-b border-slate-200 p-5 dark:border-white/10">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-400">
        Primeros pasos
      </p>
      <h2 className="mt-2 text-xl font-black">Explora LinkChat</h2>
    </div>
  )

  const sidebarContent = (
    <div className="p-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
      Aún no perteneces a un servidor. Puedes elegir uno de la lista o usar el
      botón de invitación junto a tu perfil.
    </div>
  )

  return (
    <AppShell
      currentUser={currentUser}
      servers={[]}
      selectedServer={null}
      onHome={() => {}}
      onLogout={onLogout}
      onProfile={onProfile}
      onServerJoined={onServerJoined}
      onServerSelected={() => {}}
      sidebarHeader={sidebarHeader}
      sidebarContent={sidebarContent}
    >
      <main className="h-full overflow-y-auto overflow-x-hidden bg-slate-50 text-slate-950 dark:bg-slate-900 dark:text-slate-100">
      <section className="relative overflow-hidden bg-slate-950 px-5 py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.22),transparent_30%),radial-gradient(circle_at_85%_50%,rgba(99,102,241,0.2),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <span className="grid size-14 place-items-center rounded-2xl bg-teal-400 text-slate-950">
            <Compass size={28} />
          </span>
          <p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-teal-300">
            Bienvenido a LinkChat
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
            Tu próxima comunidad está a un clic.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Aún no perteneces a ningún servidor. Explora las comunidades
            disponibles, únete a una y comienza a conversar en sus canales.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-teal-700">
              Servidores disponibles
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Encuentra tu lugar
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {servers.length} {servers.length === 1 ? 'servidor' : 'servidores'} para explorar
          </p>
        </div>

        {error ? (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            {error}
          </div>
        ) : null}

        {servers.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-white/15 dark:bg-slate-950">
            <Server className="mx-auto text-slate-300" size={34} />
            <h3 className="mt-4 text-xl font-bold">Todavía no hay servidores</h3>
            <p className="mt-2 text-slate-500">Vuelve pronto para descubrir nuevas comunidades.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {servers.map((server) => {
              const isJoining = joiningServerId === server.id

              return (
                <article
                  key={server.id}
                  className="flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-950"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-12 place-items-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                      {getInitials(server.name)}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                      <UsersRound size={14} /> Comunidad
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{server.name}</h3>
                  <p className="mt-2 flex-1 leading-7 text-slate-600 dark:text-slate-400">
                    {server.description || 'Una comunidad abierta para conversar y compartir.'}
                  </p>
                  <button
                    type="button"
                    className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    disabled={Boolean(joiningServerId)}
                    onClick={() => onJoin(server)}
                  >
                    {isJoining ? <LoaderCircle className="animate-spin" size={18} /> : null}
                    {isJoining ? 'Uniéndote…' : 'Unirme al servidor'}
                    {!isJoining ? <ArrowRight size={18} /> : null}
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </section>
      </main>
    </AppShell>
  )
}

function AppHome({
  currentUser,
  onLogout,
  onProfile,
  onServerJoined,
  onServerSelected,
  onServersLoaded,
}) {
  const [memberships, setMemberships] = useState([])
  const [availableServers, setAvailableServers] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [joiningServerId, setJoiningServerId] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadHome() {
      try {
        const loadedMemberships = await getMyServersUseCase.execute()
        if (!isActive) return

        setMemberships(loadedMemberships)
        onServersLoaded(loadedMemberships.map((membership) => membership.server))

        if (loadedMemberships.length === 0) {
          const servers = await getServersUseCase.execute()
          if (!isActive) return
          setAvailableServers(servers)
        }

        setError('')
      } catch (currentError) {
        if (isActive) setError(currentError.message)
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadHome()
    return () => {
      isActive = false
    }
  }, [onServersLoaded])

  async function handleJoin(server) {
    try {
      setJoiningServerId(server.id)
      setError('')
      const membership = await joinServerUseCase.execute({ serverId: server.id })
      setMemberships([membership])
      onServerJoined(membership.server)
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setJoiningServerId('')
    }
  }

  if (isLoading) return <LoadingApp />

  if (memberships.length > 0) {
    return (
      <ChatHome
        currentUser={currentUser}
        servers={memberships.map((membership) => membership.server)}
        onLogout={onLogout}
        onProfile={onProfile}
        onServerJoined={onServerJoined}
        onServerSelected={onServerSelected}
      />
    )
  }

  return (
    <WelcomeServers
      currentUser={currentUser}
      servers={availableServers}
      error={error}
      joiningServerId={joiningServerId}
      onJoin={handleJoin}
      onLogout={onLogout}
      onProfile={onProfile}
      onServerJoined={onServerJoined}
    />
  )
}

export default AppHome
