import { normalizeUsers } from '../utils/users'
import { getUsers } from './users-api'

export async function getContacts(currentUserId) {
  const users = await getUsers()

  return normalizeUsers(users).filter((user) => user.id !== currentUserId)
}
