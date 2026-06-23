import { useState } from 'react'
import JoinInvitePage from './pages/join-invite'
import LandingPage from './pages/landing'
import ServerPage from './pages/server'
import SelectUser from './pages/select-user'
import {
  getInvitationByCode,
  getServerById,
  joinInvitation,
} from './services/chat-api'
import { startUser } from './services/users-api'

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

function getInviteCodeFromPath() {
  const segments = window.location.pathname.split('/').filter(Boolean)

  if (segments[0] === 'invite' && segments[1]) {
    return decodeURIComponent(segments[1])
  }

  if (
    segments[0] === 'api' &&
    segments[1] === 'invitations' &&
    segments[2] === 'join' &&
    segments[3]
  ) {
    return decodeURIComponent(segments[3])
  }

  return ''
}

function clearInvitePath() {
  if (window.location.pathname !== '/') {
    window.history.replaceState({}, '', '/')
  }
}

function App() {
  const initialInviteCode = getInviteCodeFromPath()
  const [currentUser, setCurrentUser] = useState(() => getStoredUser())
  const [selectedServer, setSelectedServer] = useState(null)
  const [pendingInvite, setPendingInvite] = useState(null)
  const [directInviteCode, setDirectInviteCode] = useState(initialInviteCode)
  const [screen, setScreen] = useState(
    initialInviteCode ? 'join-invite' : 'landing',
  )

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
    clearInvitePath()
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

  async function handleDirectInviteJoin(invite, username) {
    const user = await startUser(username)

    setCurrentUser(user)
    saveUser(user)
    await joinInviteWithUser(invite, user)
  }

  function handleBackToLanding() {
    setPendingInvite(null)
    setDirectInviteCode('')
    clearInvitePath()
    setScreen('landing')
  }

  function handleLogout() {
    setSelectedServer(null)
    setPendingInvite(null)
    setDirectInviteCode('')
    setCurrentUser(null)
    clearStoredUser()
    clearInvitePath()
    setScreen('landing')
  }

  if (screen === 'join-invite') {
    return (
      <JoinInvitePage
        code={directInviteCode}
        onBack={handleBackToLanding}
        onJoin={handleDirectInviteJoin}
        onLoadInvite={resolveInvite}
      />
    )
  }

  if (screen === 'landing') {
    return (
      <LandingPage
        currentUser={currentUser}
        onJoinInvite={handleJoinInvite}
      />
    )
  }

  if (!currentUser || screen === 'select-user') {
    return (
      <SelectUser
        helperText={
          pendingInvite
            ? (
                <>
                  Selecciona un usuario para unirte al servidor{' '}
                  <strong>{pendingInvite.server.name}</strong>.
                </>
              )
            : undefined
        }
        onBack={handleBackToLanding}
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

  return <LandingPage currentUser={currentUser} onJoinInvite={handleJoinInvite} />
}

export default App
