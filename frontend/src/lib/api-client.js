const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

export function getAuthToken() {
  return localStorage.getItem('linkchat-auth-token')
}

export function saveAuthToken(token) {
  localStorage.setItem('linkchat-auth-token', token)
}

export function clearAuthToken() {
  localStorage.removeItem('linkchat-auth-token')
}

export async function request(path, options = {}) {
  const token = getAuthToken()
  const isFormData = options.body instanceof FormData

  const headers = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message ?? 'No se pudo completar la solicitud')
  }

  return data
}