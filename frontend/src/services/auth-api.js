import { request } from '../lib/api-client'

export async function registerUser({ name, email, password, avatar }) {
  const formData = new FormData()

  formData.append('name', name)
  formData.append('email', email)
  formData.append('password', password)

  if (avatar) {
    formData.append('avatar', avatar)
  }

  return request('/api/auth/register', {
    method: 'POST',
    body: formData,
  })
}

export async function loginUser({ email, password }) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function getCurrentUser() {
  return request('/api/auth/me')
}