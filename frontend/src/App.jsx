import { useMemo, useState } from 'react'
import ChatHome from './pages/chat-home'
import ServerPage from './pages/server'
import SelectUser from './pages/select-user'
import { joinInvitation } from './services/invitations-api'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [selectedServer, setSelectedServer] = useState(null)
  const [error, setError] = useState('')
  const [isJoiningInvitation, setIsJoiningInvitation] = useState(false)

  const inviteCode = useMemo(() => {
    const path = window.location.pathname

    if (!path.startsWith('/invite/')) {
      return ''
    }

    return decodeURIComponent(path.replace('/invite/', ''))
  }, [])

  async function handleUserSelected(user) {
    setCurrentUser(user)

    if (!inviteCode) {
      return
    }

    try {
      setIsJoiningInvitation(true)
      setError('')

      const data = await joinInvitation(inviteCode, user.username)

      if (data.server) {
        setSelectedServer({
          id: data.server._id ?? data.server.id,
          name: data.server.name,
          description: data.server.description,
          role: data.member?.role ?? 'member',
        })
      }
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setIsJoiningInvitation(false)
    }
  }

  if (!currentUser) {
    return <SelectUser onUserSelected={handleUserSelected} />
  }

  if (isJoiningInvitation) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 text-slate-950">
        <div className="rounded-lg bg-white p-6 shadow">
          Uniéndote al servidor de la invitación...
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 text-slate-950">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 shadow">
          <p className="font-bold">Error al usar la invitación</p>
          <p className="mt-2">{error}</p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-red-700 px-4 py-2 font-bold text-white"
            onClick={() => {
              setError('')
              window.history.replaceState(null, '', '/')
            }}
          >
            Ir al inicio
          </button>
        </div>
      </main>
    )
  }

  if (selectedServer) {
    return (
      <ServerPage
        currentUser={currentUser}
        server={selectedServer}
        onBack={() => setSelectedServer(null)}
        onLogout={() => {
          setSelectedServer(null)
          setCurrentUser(null)
        }}
      />
    )
  }

  return (
    <ChatHome
      currentUser={currentUser}
      onLogout={() => setCurrentUser(null)}
      onServerSelected={setSelectedServer}
    />
  )
}

export default App