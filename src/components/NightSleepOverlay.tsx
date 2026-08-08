import React from 'react';
import { Moon, Sparkles } from 'lucide-react';

interface NightSleepOverlayProps {
  isVisible: boolean;
}

export const NightSleepOverlay: React.FC<NightSleepOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-40 bg-radial from-[#0a0a0e] via-[#050507] to-black flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        {/* Crescent Moon Visual */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl animate-pulse" />
          <div className="w-20 h-20 rounded-full border-b-4 border-r-4 border-amber-400 rotate-[-30deg] shadow-[0_0_20px_rgba(251,191,36,0.4)]" />
        </div>

        <h2 className="font-serif text-2xl font-bold text-slate-100 tracking-wider">
          Màn đêm buông xuống...
        </h2>

        <p className="text-xs text-slate-400 italic">
          Hãy nhắm mắt đi ngủ và cầu nguyện cho bình minh rực rỡ!
        </p>

        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 px-4 py-2 rounded-full text-xs font-bold shadow-lg">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Lượt đi đêm của bạn đã hoàn tất</span>
        </div>
      </div>
    </div>
  );
};
