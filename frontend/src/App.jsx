import { useState } from 'react'
import AuthPage from './pages/auth'
import ChatHome from './pages/chat-home'
import JoinInvitePage from './pages/join-invite'
import LandingPage from './pages/landing'
import ServerPage from './pages/server'
import {
  clearAuthToken,
  saveAuthToken,
} from './lib/api-client'
import {
  getInvitationByCode,
  joinInvitation,
} from './services/invitations-api'
import { getServerById } from './services/servers-api'

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

function normalizeUser(user) {
  return {
    id: user._id ?? user.id,
    email: user.email,
    name: user.name,
    username: user.username ?? user.name,
    avatarUrl: user.avatarUrl ?? null,
    status: user.status,
  }
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

  return ''
}

function clearInvitePath() {
  if (window.location.pathname !== '/') {
    window.history.replaceState({}, '', '/')
  }
}

function App() {
  const initialInviteCode = getInviteCodeFromPath()
  const storedUser = getStoredUser()

  const [currentUser, setCurrentUser] = useState(storedUser)
  const [selectedServer, setSelectedServer] = useState(null)
  const [pendingInvite, setPendingInvite] = useState(null)
  const [directInviteCode, setDirectInviteCode] = useState(initialInviteCode)
  const [screen, setScreen] = useState(
    initialInviteCode ? 'join-invite' : storedUser ? 'home' : 'landing',
  )

  async function resolveInvite(code) {
    const data = await getInvitationByCode(code)
    const invitation = data.invitation ?? data

    const inviteServer = invitation.serverId ?? invitation.server

    if (!inviteServer) {
      throw new Error('La invitación no tiene un servidor asociado.')
    }

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

  async function joinInviteWithCurrentSession(invite) {
    const data = await joinInvitation(invite.code)

    const joinedServer = data.server
      ? normalizeServer(data.server, data.member?.role ?? 'member')
      : invite.server

    setPendingInvite(null)
    setSelectedServer(joinedServer)
    setDirectInviteCode('')
    setScreen('home')
    clearInvitePath()
  }

  async function handleJoinInvite(code) {
    const invite = await resolveInvite(code)

    if (!currentUser) {
      setPendingInvite(invite)
      setScreen('auth')
      return
    }

    await joinInviteWithCurrentSession(invite)
  }

  async function handleInviteContinue(invite) {
    if (!currentUser) {
      setPendingInvite(invite)
      setScreen('auth')
      return
    }

    await joinInviteWithCurrentSession(invite)
  }

  async function handleAuthenticated(user, token) {
    const normalizedUser = normalizeUser(user)

    saveAuthToken(token)
    saveUser(normalizedUser)
    setCurrentUser(normalizedUser)

    if (pendingInvite) {
      await joinInviteWithCurrentSession(pendingInvite)
      return
    }

    setScreen('home')
  }

  function handleBackToLanding() {
    setPendingInvite(null)
    setSelectedServer(null)
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
    clearAuthToken()
    clearInvitePath()
    setScreen('landing')
  }

  if (screen === 'join-invite') {
    return (
      <JoinInvitePage
        code={directInviteCode}
        currentUser={currentUser}
        onBack={handleBackToLanding}
        onContinue={handleInviteContinue}
        onLoadInvite={resolveInvite}
      />
    )
  }

  if (screen === 'auth') {
    return (
      <AuthPage
        helperText={
          pendingInvite
            ? `Inicia sesión o crea una cuenta para unirte al servidor ${pendingInvite.server.name}.`
            : undefined
        }
        onBack={handleBackToLanding}
        onAuthenticated={handleAuthenticated}
      />
    )
  }

  if (screen === 'landing') {
    return (
      <LandingPage
        currentUser={currentUser}
        onJoinInvite={handleJoinInvite}
        onLogin={() => setScreen('auth')}
        onEnterApp={() => setScreen(currentUser ? 'home' : 'auth')}
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

  if (!currentUser) {
    return (
      <AuthPage
        onBack={handleBackToLanding}
        onAuthenticated={handleAuthenticated}
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