import { useState } from 'react'
import ChatHome from './pages/chat-home'
import ServerPage from './pages/server'
import SelectUser from './pages/select-user'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [selectedServer, setSelectedServer] = useState(null)

  if (!currentUser) {
    return <SelectUser onUserSelected={setCurrentUser} />
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
