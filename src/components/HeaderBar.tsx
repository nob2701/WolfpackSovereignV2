import React from 'react';
import { RoomMeta, Player } from '../types';
import { Moon, Sun, Clock, Crown, ArrowLeft, Shield } from 'lucide-react';

interface HeaderBarProps {
  roomMeta: RoomMeta | null;
  players: Player[];
  onOpenLeftDrawer?: () => void;
  onOpenRightDrawer?: () => void;
  onLeaveToLobby: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  roomMeta,
  players,
  onLeaveToLobby
}) => {
  const isNight = roomMeta?.phase === 'night';
  const dayNum = roomMeta?.day || 1;
  const mayor = players.find(p => p.id === roomMeta?.mayorId);

  return (
    <header className="h-14 sm:h-16 bg-[#08080d]/90 border-b border-white/10 px-3 sm:px-6 flex items-center justify-between z-30 backdrop-blur-xl sticky top-0 shadow-lg">
      
      {/* Left Brand & Phase Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onLeaveToLobby}
          className="flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 px-2.5 py-1.5 text-xs font-semibold transition active:scale-95 shrink-0"
          title="Rời về sảnh"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-300" />
          <span className="hidden sm:inline">Thoát</span>
        </button>

        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md transition-all ${
            isNight 
              ? "bg-gradient-to-br from-indigo-900 to-purple-950 border border-purple-500/30 shadow-purple-950/50" 
              : "bg-gradient-to-br from-amber-500 to-rose-600 border border-amber-400/30 shadow-amber-950/50"
          }`}>
            {isNight ? <Moon className="w-4 h-4 text-purple-300" /> : <Sun className="w-4 h-4 text-amber-100" />}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <h1 className="text-xs sm:text-sm font-black tracking-wider text-white">
                WOLFPACK <span className="text-red-500">SOVEREIGN</span>
              </h1>
            </div>
            <span className={`text-[9px] sm:text-[10px] uppercase tracking-widest font-bold ${isNight ? "text-purple-400" : "text-amber-400"}`}>
              {isNight ? `🌙 ĐÊM ${dayNum}` : `☀️ NGÀY ${dayNum}`}
            </span>
          </div>
        </div>
      </div>

      {/* Center Group: Digital Phase Countdown Timer */}
      <div className="flex flex-col items-center justify-center px-2 py-0.5 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex items-center gap-1 text-xs sm:text-sm font-mono font-black text-red-400 tracking-widest">
          <Clock className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span id="phase-timer-display">00:00</span>
        </div>
        <div className="w-20 sm:w-32 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
          <div
            id="phase-timer-bar"
            className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
            style={{ width: '100%' }}
          ></div>
        </div>
      </div>

      {/* Right Group: Room Info & Mayor */}
      <div className="flex items-center gap-2">
        {/* Room Code Badge */}
        <div className="flex flex-col items-end px-2 py-1 rounded-xl bg-white/5 border border-white/10">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-slate-400 font-bold">MÃ PHÒNG</span>
          <span className="font-mono text-xs font-extrabold text-red-400">#{roomMeta?.roomId || "MAIN"}</span>
        </div>

        {/* Mayor Badge */}
        {mayor && (
          <div className="hidden sm:flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl text-xs font-bold text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="truncate max-w-[70px]">{mayor.name}</span>
          </div>
        )}
      </div>
    </header>
  );
};


