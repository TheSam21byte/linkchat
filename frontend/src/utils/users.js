export function getInitials(value = '') {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function normalizeUser(user) {
  return {
    id: user._id ?? user.id,
    username: user.username,
    status: user.status,
  }
}

export function normalizeUsers(users = []) {
  return users.map(normalizeUser)
}
