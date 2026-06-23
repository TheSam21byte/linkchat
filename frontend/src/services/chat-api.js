import { getUsers } from './users-api'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message ?? 'No se pudo completar la solicitud')
  }

  return data
}

export async function getContacts(currentUserId) {
  const users = await getUsers()

  return users
    .map((user) => ({
      id: user._id ?? user.id,
      username: user.username,
      status: user.status,
    }))
    .filter((user) => user.id !== currentUserId)
}

export async function getUserServers(userId) {
  const data = await request(`/api/members/user/${userId}`)

  return (data.memberships ?? []).map((membership) => ({
    id: membership.serverId?._id ?? membership.serverId?.id,
    name: membership.serverId?.name,
    description: membership.serverId?.description,
    role: membership.role,
  }))
}

export async function getServerById(serverId) {
  const server = await request(`/api/servers/${serverId}`)

  return {
    id: server._id ?? server.id,
    name: server.name,
    description: server.description,
    ownerId: server.ownerId,
  }
}

export async function getInvitationByCode(code) {
  return request(`/api/invitations/${code}`)
}

export async function joinInvitation({ code, username }) {
  return request(`/api/invitations/join/${code}`, {
    method: 'POST',
    body: JSON.stringify({ username }),
  })
}

export async function getDirectMessages(userId, contactId) {
  const data = await request(`/api/direct-messages/${userId}/${contactId}`)

  return data.messages ?? []
}

export async function sendDirectMessage({ fromUserId, toUserId, content }) {
  const data = await request('/api/direct-messages', {
    method: 'POST',
    body: JSON.stringify({ fromUserId, toUserId, content }),
  })

  return data.directMessage
}

export async function getServerChannels(serverId) {
  const data = await request(`/api/channels/server/${serverId}`)

  return (data.channels ?? []).map((channel) => ({
    id: channel._id ?? channel.id,
    name: channel.name,
    serverId: channel.serverId,
  }))
}

export async function getChannelMessages(channelId) {
  const data = await request(`/api/messages/channel/${channelId}`)

  return data.messages ?? []
}

export async function sendChannelMessage({ channelId, username, content }) {
  const data = await request(`/api/messages/channel/${channelId}`, {
    method: 'POST',
    body: JSON.stringify({ username, content }),
  })

  return data.channelMessage
}
