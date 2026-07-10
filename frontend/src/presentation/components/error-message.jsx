import { AlertCircle } from 'lucide-react'

function ErrorMessage({ children, className = '' }) {
  if (!children) return null

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 ${className}`}
    >
      <AlertCircle className="mt-0.5 shrink-0" size={18} />
      <span>{children}</span>
    </div>
  )
}

export default ErrorMessage
