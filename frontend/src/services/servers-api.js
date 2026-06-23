import { request } from '../lib/api-client'

function normalizeServer(server, role) {
  return {
    id: server._id ?? server.id,
    name: server.name,
    description: server.description,
    ownerId: server.ownerId,
    role,
  }
}

export async function createServer({ name, description, ownerUsername }) {
  const data = await request('/api/servers', {
    method: 'POST',
    body: JSON.stringify({ name, description, ownerUsername }),
  })

  return {
    server: normalizeServer(data.server, data.member?.role ?? 'owner'),
    defaultChannel: data.defaultChannel,
    owner: data.owner,
  }
}

export async function getServers() {
  const data = await request('/api/servers')

  return (data.servers ?? []).map((server) => normalizeServer(server))
}

export async function getServerById(serverId) {
  const data = await request(`/api/servers/${serverId}`)

  return normalizeServer(data)
}
