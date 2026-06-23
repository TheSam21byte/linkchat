import { io } from 'socket.io-client'

const SOCKET_BASE_URL =
  import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL ?? ''

export function createChatSocket() {
  return io(SOCKET_BASE_URL, {
    transports: ['websocket'],
  })
}
