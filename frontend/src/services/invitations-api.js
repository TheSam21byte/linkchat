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
  return request(`/api/invitations/${code}`)
}

export async function joinInvitation({ code, username }) {
  return request(`/api/invitations/join/${code}`, {
    method: 'POST',
    body: JSON.stringify({ username }),
  })
}

export async function disableInvitation(code) {
  return request(`/api/invitations/${code}/disable`, {
    method: 'PATCH',
  })
}
