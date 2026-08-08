import React, { useEffect, useState } from 'react';
import { Player } from '../types';
import { db, ref, set, onValue } from '../services/firebase';
import { BarChart3 } from 'lucide-react';

interface SpectatorWidgetProps {
  myPlayer: Player | null;
  roomId: string | null;
  showToast: (msg: string, type?: 'info' | 'success' | 'danger' | 'warning') => void;
}

export const SpectatorWidget: React.FC<SpectatorWidgetProps> = ({
  myPlayer,
  roomId,
  showToast
}) => {
  const [poll, setPoll] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!roomId) return;
    const pollRef = ref(db, `rooms/${roomId}/prediction_poll`);
    const unsub = onValue(pollRef, (snap) => {
      setPoll(snap.val() || {});
    });
    return () => unsub();
  }, [roomId]);

  if (!myPlayer || myPlayer.alive) return null;

  const total = Object.keys(poll).length || 1;
  let villageCount = 0;
  let wolfCount = 0;
  let thirdCount = 0;

  Object.values(poll).forEach(fac => {
    if (fac === 'village') villageCount++;
    if (fac === 'wolf') wolfCount++;
    if (fac === 'third') thirdCount++;
  });

  const vilPct = Math.round((villageCount / total) * 100);
  const wolfPct = Math.round((wolfCount / total) * 100);
  const thirdPct = Math.round((thirdCount / total) * 100);

  const handleVotePoll = async (faction: 'village' | 'wolf' | 'third') => {
    if (!roomId || !myPlayer) return;
    await set(ref(db, `rooms/${roomId}/prediction_poll/${myPlayer.id}`), faction);
    showToast("Đã ghi nhận dự đoán tỉ lệ thắng!", "success");
  };

  return (
    <div className="bg-[#121218]/90 border border-slate-800 rounded-2xl p-3 mb-3 shadow-lg text-left">
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
        <BarChart3 className="w-4 h-4" />
        <span>DỰ ĐOÁN TỈ LỆ THẮNG (SPECTATOR POLL)</span>
      </div>

      <div className="space-y-1.5 text-xs">
        {/* Village Row */}
        <div
          onClick={() => handleVotePoll('village')}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
        >
          <span className="w-16 font-bold text-slate-300">🌾 Dân Làng</span>
          <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div style={{ width: `${vilPct}%` }} className="bg-emerald-500 h-full transition-all" />
          </div>
          <span className="w-8 text-right font-bold text-emerald-400">{vilPct}%</span>
        </div>

        {/* Wolf Row */}
        <div
          onClick={() => handleVotePoll('wolf')}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
        >
          <span className="w-16 font-bold text-slate-300">🐺 Ma Sói</span>
          <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div style={{ width: `${wolfPct}%` }} className="bg-rose-500 h-full transition-all" />
          </div>
          <span className="w-8 text-right font-bold text-rose-400">{wolfPct}%</span>
        </div>

        {/* Third Party Row */}
        <div
          onClick={() => handleVotePoll('third')}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
        >
          <span className="w-16 font-bold text-slate-300">🧛 Phe Khác</span>
          <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div style={{ width: `${thirdPct}%` }} className="bg-purple-500 h-full transition-all" />
          </div>
          <span className="w-8 text-right font-bold text-purple-400">{thirdPct}%</span>
        </div>
      </div>
    </div>
  );
};
