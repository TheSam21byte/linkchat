import { UserRound } from 'lucide-react'
import { getInitials } from '../utils/users'

function UserAvatar({ name = '', size = 'md', showFallbackIcon = false }) {
  const dimensions = {
    sm: 'size-10 text-sm',
    md: 'size-11',
    lg: 'size-12',
  }

  const initials = getInitials(name)

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-slate-900 font-bold text-white ${
        dimensions[size] ?? dimensions.md
      }`}
    >
      {initials || (showFallbackIcon ? <UserRound size={18} /> : null)}
    </span>
  )
}

export default UserAvatar
