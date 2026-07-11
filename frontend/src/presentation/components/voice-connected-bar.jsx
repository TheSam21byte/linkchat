import { Headphones, MicOff, Volume2 } from 'lucide-react'

function VoiceConnectedBar({ channelName, serverName, isMuted, isDeafened }) {
  return (
    <div className="border-t border-slate-200 bg-[#111214] px-3 py-2 dark:border-white/10">
      <div className="flex items-center gap-2">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-emerald-400">Voz conectada</p>
          <p className="truncate text-sm font-semibold text-slate-100">
            {channelName}
            <span className="font-normal text-slate-400"> / {serverName}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {isMuted ? <MicOff size={14} className="text-red-400" /> : null}
          {isDeafened ? <Headphones size={14} className="text-red-400" /> : null}
          <Volume2 size={16} className="text-emerald-400" />
        </div>
      </div>
    </div>
  )
}

export default VoiceConnectedBar
