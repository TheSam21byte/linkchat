import { ArrowRight, Server, Sparkles } from 'lucide-react'
import AppShell from '../components/app-shell'
import { truncateText } from "../utils/text.js";

function getInitials(value = '') {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function ChatHome({
  currentUser,
  servers,
  onLogout,
  onProfile,
  onServerJoined,
  onServerSelected,
}) {
  const sidebarHeader = (
    <div className="border-b border-slate-200 p-5 dark:border-white/10">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-400">
        LinkChat
      </p>
      <h2 className="mt-2 text-xl font-black">Tus comunidades</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        Selecciona un servidor para ver sus canales.
      </p>
    </div>
  )

  const sidebarContent = (
    <section className="min-w-0 max-w-full overflow-hidden p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
        <Server size={18} /> Tus servidores
      </div>
      <div className="grid min-w-0 max-w-full gap-2 overflow-hidden">
        {servers.map((server) => (
          <button
            type="button"
            key={server.id}
            className="min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-teal-300 hover:bg-teal-50 dark:border-white/10 dark:bg-slate-900 dark:hover:bg-teal-950/40"
            onClick={() => onServerSelected(server)}
          >
            <p className="block w-full min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-semibold" title={server.name}>
              {truncateText(server.name)}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              {server.role}
            </p>
          </button>
        ))}
      </div>
    </section>
  )

  return (
    <AppShell
      currentUser={currentUser}
      servers={servers}
      selectedServer={null}
      onHome={() => {}}
      onLogout={onLogout}
      onProfile={onProfile}
      onServerJoined={onServerJoined}
      onServerSelected={onServerSelected}
      sidebarHeader={sidebarHeader}
      sidebarContent={sidebarContent}
      mobileTitle="Tus comunidades"
    >
      <section className="relative flex h-full min-h-0 min-w-0 items-center overflow-y-auto overflow-x-hidden bg-slate-50 px-4 py-8 dark:bg-slate-900 sm:px-6 sm:py-12">
        <div className="absolute -right-32 -top-24 size-96 rounded-full bg-teal-200/40 blur-3xl dark:bg-teal-700/10" />
        <div className="relative mx-auto w-full max-w-4xl">
          <span className="grid size-12 place-items-center rounded-2xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 sm:size-14">
            <Sparkles size={26} />
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-400 sm:mt-7 sm:text-sm">
            Tu espacio en LinkChat
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
            Elige una comunidad y continúa la conversación.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:mt-5 sm:text-lg sm:leading-8">
            Ya formas parte de {servers.length} {servers.length === 1 ? 'servidor' : 'servidores'}.
            Selecciona uno para ver sus canales y mensajes.
          </p>

          <div className="mt-7 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4">
            {servers.map((server) => (
              <button
                type="button"
                key={server.id}
                className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg dark:border-white/10 dark:bg-slate-950 sm:gap-4 sm:p-5"
                onClick={() => onServerSelected(server)}
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-slate-950 text-sm font-bold text-white dark:bg-teal-400 dark:text-slate-950">
                  {getInitials(server.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-lg" title={server.name}>
                    {truncateText(server.name)}
                  </strong>
                  <small className="mt-1 block truncate text-slate-500 dark:text-slate-400">
                    {server.description || 'Comunidad de LinkChat'}
                  </small>
                </span>
                <ArrowRight className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-teal-600" size={20} />
              </button>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  )
}

export default ChatHome
