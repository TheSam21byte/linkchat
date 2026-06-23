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

export async function getInvitationByCode(code) {
  return request(`/api/invitations/${encodeURIComponent(code)}`)
}

export async function joinInvitation(code, username) {
  return request(`/api/invitations/join/${encodeURIComponent(code)}`, {
    method: 'POST',
    body: JSON.stringify({ username }),
  })
}