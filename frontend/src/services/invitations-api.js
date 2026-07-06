import { request } from '../lib/api-client'

export async function createInvitation({ serverId, code }) {
  const data = await request('/api/invitations', {
    method: 'POST',
    body: JSON.stringify({ serverId, code }),
  })

  return {
    invitation: data.invitation,
    inviteUrl: data.inviteUrl,
  }
}

export async function getInvitations() {
  const data = await request('/api/invitations')

  return data.invitations ?? []
}

export async function getInvitationByCode(code) {
  return request(`/api/invitations/${encodeURIComponent(code)}`)
}

export async function joinInvitation(code) {
  return request(`/api/invitations/join/${encodeURIComponent(code)}`, {
    method: 'POST',
  })
}

export async function disableInvitation(code) {
  return request(`/api/invitations/${encodeURIComponent(code)}/disable`, {
    method: 'PATCH',
  })
}