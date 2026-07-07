import { request } from '../lib/api-client'

function normalizeMembership(membership) {
  return {
    id: membership._id ?? membership.id,
    role: membership.role,
    active: membership.active,
    joinedAt: membership.joinedAt,
    server: {
      id: membership.serverId?._id ?? membership.serverId?.id,
      name: membership.serverId?.name,
      description: membership.serverId?.description,
      ownerId: membership.serverId?.ownerId,
      role: membership.role,
    },
  }
}

export async function getMyServers() {
  const data = await request('/api/members/me')

  return (data.memberships ?? []).map(normalizeMembership)
}

export async function joinServer(serverId) {
  const data = await request(`/api/members/join/${serverId}`, {
    method: 'POST',
  })

  return normalizeMembership(data.membership)
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

export async function getServerMembers(serverId) {
  const data = await request(`/api/members/server/${serverId}`)

  return (data.members ?? []).map((member) => ({
    id: member._id ?? member.id,
    role: member.role,
    active: member.active,
    joinedAt: member.joinedAt,
    user: {
      id: member.userId?._id ?? member.userId?.id,
      name: member.userId?.name,
      username: member.userId?.username,
      avatarUrl: member.userId?.avatarUrl,
      status: member.userId?.status,
      lastSeen: member.userId?.lastSeen,
    },
  }))
}
