import React, { useState } from 'react';
import { Player } from '../types';
import { getRoleName, getRoleDesc } from '../data/roles';
import { Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface IdentityCardProps {
  myPlayer: Player | null;
  isGM: boolean;
  showToast: (msg: string, type?: 'info' | 'success' | 'danger' | 'warning') => void;
}

export const IdentityCard: React.FC<IdentityCardProps> = ({ myPlayer, isGM }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  if (isGM || !myPlayer) return null;

  const roleName = getRoleName(myPlayer.role).toUpperCase();
  const factionName = myPlayer.realFaction === 'wolf' 
    ? 'MA SÓI 🐺' 
    : myPlayer.realFaction === 'third' 
    ? 'PHE THỨ BA 🧛' 
    : 'DÂN LÀNG 🌾';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-red-950/40 via-black/60 to-slate-900/40 border border-red-500/30 rounded-2xl p-4 shadow-2xl relative overflow-hidden backdrop-blur-md"
    >
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-red-400" />
          <h3 className="text-xs font-black text-red-500 uppercase tracking-widest">
            SECRET IDENTITY CARD
          </h3>
        </div>
        <button
          onClick={() => setIsRevealed(!isRevealed)}
          className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 text-[11px] font-bold px-3 py-1 rounded-xl transition shadow"
        >
          {isRevealed ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-red-400" />
              <span>Ẩn căn cước</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-amber-300" />
              <span>Xem căn cước</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-900 border border-red-500/30 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg shadow-red-900/40">
          <Sparkles className="w-6 h-6 text-amber-300" />
        </div>

        <div className="flex-1 text-left space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Vai trò bí mật:</span>
            <strong className={`font-black text-sm tracking-wide transition-all ${
              isRevealed ? "text-amber-300 blur-none" : "text-slate-500 blur-sm select-none"
            }`}>
              {isRevealed ? roleName : "████████"}
            </strong>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Phe phái:</span>
            <strong className={`font-bold transition-all ${
              isRevealed ? "text-emerald-400 blur-none" : "text-slate-500 blur-sm select-none"
            }`}>
              {isRevealed ? factionName : "████████"}
            </strong>
          </div>

          <p className="text-[11px] text-slate-300 italic pt-1 border-t border-white/5 leading-relaxed">
            {isRevealed
              ? getRoleDesc(myPlayer.role)
              : "Bấm nút 'Xem căn cước' phía trên để giải mờ vai trò và kỹ năng bí mật của bạn."}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
