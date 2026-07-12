import { useState } from 'react'
import { UserRound } from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function getAvatarSrc(avatarUrl) {
  if (!avatarUrl) return ''

  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl
  }

  return `${API_BASE_URL}${avatarUrl}`
}

function UserAvatar({
  user,
  name,
  avatarUrl,
  className = 'size-11',
  textClassName = 'text-sm',
}) {
  const [hasImageError, setHasImageError] = useState(false)

  const displayName = name ?? user?.name ?? user?.username ?? ''
  const imageUrl = getAvatarSrc(avatarUrl ?? user?.avatarUrl)

  if (imageUrl && !hasImageError) {
    return (
      <img
        src={imageUrl}
        alt={displayName ? `Avatar de ${displayName}` : 'Avatar de usuario'}
        className={`${className} rounded-full object-cover`}
        onError={() => setHasImageError(true)}
      />
    )
  }

  return (
    <span
      className={`${className} ${textClassName} grid place-items-center rounded-full bg-slate-900 font-bold text-white`}
    >
      {getInitials(displayName) || <UserRound size={18} aria-hidden="true" />}
    </span>
  )
}

export default UserAvatar