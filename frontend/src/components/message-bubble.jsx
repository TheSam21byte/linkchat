import { formatTime } from '../utils/datetime'

function MessageBubble({ author, content, createdAt, isMine }) {
  return (
    <article
      className={`max-w-[75%] rounded-lg px-4 py-3 shadow-sm ${
        isMine ? 'ml-auto bg-teal-700 text-white' : 'mr-auto bg-white text-slate-900'
      }`}
    >
      {author ? (
        <div className="mb-1 flex items-center justify-between gap-3">
          <strong className={`text-sm ${isMine ? 'text-teal-50' : 'text-teal-700'}`}>
            {author}
          </strong>
          <time className={`text-xs ${isMine ? 'text-teal-50' : 'text-slate-400'}`}>
            {formatTime(createdAt)}
          </time>
        </div>
      ) : null}

      <p className="break-words">{content}</p>

      {!author ? (
        <time className={`mt-2 block text-xs ${isMine ? 'text-teal-50' : 'text-slate-400'}`}>
          {formatTime(createdAt)}
        </time>
      ) : null}
    </article>
  )
}

export default MessageBubble
