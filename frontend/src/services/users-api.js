import { request } from '../lib/api-client'

export async function getUsers() {
  const data = await request('/api/users')

  return data.users ?? []
}

export async function startUser(username) {
  const data = await request('/api/users/start', {
    method: 'POST',
    body: JSON.stringify({ username }),
  })

  return data.user
}

export async function updateCurrentUser({ name, username, email, avatar }) {
  const formData = new FormData()

  formData.append('name', name)
  formData.append('username', username)
  formData.append('email', email)

  if (avatar) {
    formData.append('avatar', avatar)
  }

  const data = await request('/api/users/me', {
    method: 'PATCH',
    body: formData,
  })

  return data.user
}
