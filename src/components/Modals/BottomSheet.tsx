import React, { useState } from 'react';
import { Player } from '../../types';
import { getRoleName } from '../../data/roles';
import { sound } from '../../services/audio';
import { User, Skull, X, AlertTriangle } from 'lucide-react';

interface BottomSheetProps {
  player: Player | null;
  isGM: boolean;
  myPlayerId: string | null;
  onClose: () => void;
  onKillPlayer: (playerId: string) => void;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  player,
  isGM,
  myPlayerId,
  onClose,
  onKillPlayer
}) => {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  if (!player) return null;

  const hasRightToSeeRole = isGM || !player.alive || player.id === myPlayerId;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (currentY - startY > 80) {
      onClose();
    }
    setStartY(0);
    setCurrentY(0);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-[#121218] border-t-2 border-amber-500 rounded-t-3xl p-5 w-full max-w-md text-left space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300"
      >
        {/* Drag handle */}
        <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-2 opacity-60" />

        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-serif font-bold text-amber-400 uppercase tracking-wider">
            LÝ LỊCH THẦN DÂN
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Player Profile */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#050507] border border-amber-500/50 flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">{player.name}</h3>
            <p className="text-[10px] font-mono text-slate-500">Mã: {player.id}</p>
          </div>
        </div>

        {/* Status Rows */}
        <div className="space-y-2 text-xs divide-y divide-slate-800/60">
          <div className="flex justify-between pt-2">
            <span className="text-slate-400">Sinh Mệnh:</span>
            <strong className={player.alive ? "text-emerald-400" : "text-rose-500"}>
              {player.alive ? "🟢 CÒN SỐNG" : "🪦 ĐÃ HY SINH"}
            </strong>
          </div>

          <div className="flex justify-between pt-2">
            <span className="text-slate-400">Vai Trò:</span>
            <strong className="text-amber-300">
              {hasRightToSeeRole ? getRoleName(player.role).toUpperCase() : "❓ ĐANG ẨN GIẤU"}
            </strong>
          </div>
        </div>

        {/* GM God-mode Kill Action */}
        {isGM && player.alive && (
          <div className="bg-rose-950/20 border border-rose-800/50 rounded-xl p-3 space-y-2">
            <p className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>HÀNH ĐỘNG QUẢN TRÒ TỐI CAO:</span>
            </p>
            <button
              onClick={() => {
                sound.playSFX('click');
                onKillPlayer(player.id);
                onClose();
              }}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition shadow"
            >
              <Skull className="w-3.5 h-3.5" />
              <span>XỬ TỬ THẦN DÂN NÀY</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
