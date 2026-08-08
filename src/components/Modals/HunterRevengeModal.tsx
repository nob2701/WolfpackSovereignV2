import React, { useState, useEffect } from 'react';
import { Player } from '../../types';
import { Crosshair, Clock } from 'lucide-react';

interface HunterRevengeModalProps {
  isOpen: boolean;
  players: Player[];
  onFire: (targetId: string) => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'danger' | 'warning') => void;
}

export const HunterRevengeModal: React.FC<HunterRevengeModalProps> = ({
  isOpen,
  players,
  onFire,
  showToast
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [timer, setTimer] = useState(15);

  useEffect(() => {
    if (!isOpen) return;
    setTimer(15);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          const valid = players.filter(p => p.alive);
          const chosen = selectedId || (valid.length > 0 ? valid[Math.floor(Math.random() * valid.length)].id : null);
          if (chosen) onFire(chosen);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, players, selectedId]);

  if (!isOpen) return null;

  const validTargets = players.filter(p => p.alive);

  const handleSubmit = () => {
    if (!selectedId) {
      showToast("Vui lòng chọn 1 mục tiêu để nổ súng!", "warning");
      return;
    }
    onFire(selectedId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121218] border-2 border-rose-600 rounded-2xl p-5 max-w-sm w-full text-center space-y-4 shadow-2xl shadow-rose-950/50">
        <h3 className="text-sm font-serif font-bold text-rose-500 uppercase tracking-wider flex items-center justify-center gap-1.5">
          <Crosshair className="w-5 h-5 text-rose-500" />
          <span>PHÁT BẮN TIỄN BIỆT CỦA THỢ SĂN</span>
        </h3>

        <p className="text-xs text-slate-300">
          Bạn đã bị loại khỏi ván đấu! Hãy chọn 1 mục tiêu kéo theo xuống mồ:
        </p>

        <div className="flex items-center justify-center gap-1 text-xs font-bold text-amber-400">
          <Clock className="w-4 h-4" />
          <span>⏱️ Thời gian bóp cò: {timer}s</span>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {validTargets.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`p-2.5 rounded-xl border font-bold text-xs cursor-pointer transition ${
                selectedId === p.id
                  ? "bg-rose-600 border-rose-500 text-white"
                  : "bg-[#050507] border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              {p.name}
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-rose-950/50"
        >
          💥 NỔ SÚNG HẠ SÁT
        </button>
      </div>
    </div>
  );
};
