import { useState } from 'react'
import ChatHome from './pages/chat-home'
import LandingPage from './pages/landing'
import ServerPage from './pages/server'
import SelectUser from './pages/select-user'
import {
  getInvitationByCode,
  getServerById,
  joinInvitation,
} from './services/chat-api'

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('linkchat-current-user'))
  } catch {
    return null
  }
}

function saveUser(user) {
  localStorage.setItem('linkchat-current-user', JSON.stringify(user))
}

function clearStoredUser() {
  localStorage.removeItem('linkchat-current-user')
}

function normalizeServer(server, role = 'member') {
  return {
    id: server._id ?? server.id,
    name: server.name,
    description: server.description,
    role,
  }
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser())
  const [selectedServer, setSelectedServer] = useState(null)
  const [pendingInvite, setPendingInvite] = useState(null)
  const [screen, setScreen] = useState('landing')

  async function resolveInvite(code) {
    const invitation = await getInvitationByCode(code)
    const inviteServer = invitation.serverId
    const server =
      typeof inviteServer === 'object'
        ? normalizeServer(inviteServer)
        : normalizeServer(await getServerById(inviteServer))

    return {
      code,
      invitation,
      server,
    }
  }

  async function joinInviteWithUser(invite, user) {
    await joinInvitation({
      code: invite.code,
      username: user.username,
    })

    setPendingInvite(null)
    setSelectedServer(invite.server)
    setScreen('home')
  }

  async function handleJoinInvite(code) {
    const invite = await resolveInvite(code)

    if (!currentUser) {
      setPendingInvite(invite)
      setScreen('select-user')
      return
    }

    await joinInviteWithUser(invite, currentUser)
  }

  async function handleUserSelected(user) {
    if (pendingInvite) {
      await joinInviteWithUser(pendingInvite, user)
    }

    setCurrentUser(user)
    saveUser(user)
    setScreen('home')
  }

  function handleLogout() {
    setSelectedServer(null)
    setPendingInvite(null)
    setCurrentUser(null)
    clearStoredUser()
    setScreen('landing')
  }

  if (screen === 'landing') {
    return (
      <LandingPage
        currentUser={currentUser}
        onEnterApp={() => setScreen(currentUser ? 'home' : 'select-user')}
        onJoinInvite={handleJoinInvite}
      />
    )
  }

  if (!currentUser || screen === 'select-user') {
    return (
      <SelectUser
        helperText={
          pendingInvite
            ? `Selecciona un usuario para unirte al servidor ${pendingInvite.server.name}.`
            : undefined
        }
        onBack={() => setScreen('landing')}
        onUserSelected={handleUserSelected}
      />
    )
  }

  if (selectedServer) {
    return (
      <ServerPage
        currentUser={currentUser}
        server={selectedServer}
        onBack={() => setSelectedServer(null)}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <ChatHome
      currentUser={currentUser}
      onLogout={handleLogout}
      onServerSelected={setSelectedServer}
    />
  )
}

export default App
