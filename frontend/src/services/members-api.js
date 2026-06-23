import { request } from '../lib/api-client'

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
      username: member.userId?.username,
      status: member.userId?.status,
      lastSeen: member.userId?.lastSeen,
    },
  }))
}
