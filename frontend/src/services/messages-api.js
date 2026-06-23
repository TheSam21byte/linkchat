import { request } from '../lib/api-client'

export async function getChannelMessages(channelId) {
  const data = await request(`/api/messages/channel/${channelId}`)

  return data.messages ?? []
}

export function normalizeRealtimeChannelMessage(data) {
  return {
    id: data.id ?? crypto.randomUUID(),
    username: data.usuario,
    content: data.mensaje,
    channelId: data.channelId,
    createdAt: new Date().toISOString(),
  }
}

export function normalizeSystemMessage(data, channelId) {
  return {
    id: crypto.randomUUID(),
    username: data.usuario ?? 'Sistema',
    content: data.mensaje,
    channelId,
    createdAt: new Date().toISOString(),
    type: 'system',
  }
}
