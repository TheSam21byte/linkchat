export function getTypingMessage(users) {
  if (users.length === 0) return ''
  if (users.length === 1) return `${users[0]} está escribiendo…`
  if (users.length === 2) return `${users[0]} y ${users[1]} están escribiendo…`
  if (users.length === 3) {
    return `${users[0]}, ${users[1]} y ${users[2]} están escribiendo…`
  }

  return 'Varios usuarios están escribiendo…'
}
