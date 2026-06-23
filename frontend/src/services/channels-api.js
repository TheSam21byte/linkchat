import { request } from '../lib/api-client'

export async function getServerChannels(serverId) {
  const data = await request(`/api/channels/server/${serverId}`)

  return (data.channels ?? []).map((channel) => ({
    id: channel._id ?? channel.id,
    name: channel.name,
    serverId: channel.serverId,
  }))
}

export async function getChannelById(channelId) {
  const channel = await request(`/api/channels/${channelId}`)

  return {
    id: channel._id ?? channel.id,
    name: channel.name,
    serverId: channel.serverId,
  }
}

export async function createChannel({ name, serverId }) {
  const data = await request('/api/channels', {
    method: 'POST',
    body: JSON.stringify({ name, serverId }),
  })

  return {
    id: data.channel._id ?? data.channel.id,
    name: data.channel.name,
    serverId: data.channel.serverId,
  }
}
