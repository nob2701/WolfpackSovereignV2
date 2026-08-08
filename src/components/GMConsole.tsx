import React from 'react';
import { RoomMeta, LogItem } from '../types';
import { db, ref, update, get } from '../services/firebase';
import { sound } from '../services/audio';
import { Zap, Sun, Moon, Crown, Scale, Clock, Download, AlertTriangle, ShieldAlert } from 'lucide-react';

interface GMConsoleProps {
  roomId: string | null;
  roomMeta: RoomMeta | null;
  isHost: boolean;
  logs: LogItem[];
  showToast: (msg: string, type?: 'info' | 'success' | 'danger' | 'warning') => void;
  onForceDay: () => void;
  onForceNight: () => void;
  onTriggerMayor: () => void;
  onResolveVote: () => void;
  onExportLogs: () => void;
}

export const GMConsole: React.FC<GMConsoleProps> = ({
  roomId,
  roomMeta,
  isHost,
  logs,
  showToast,
  onForceDay,
  onForceNight,
  onTriggerMayor,
  onResolveVote,
  onExportLogs
}) => {
  if (!isHost || !roomId) return null;

  const handleAddTime = async () => {
    sound.playSFX('click');
    const metaRef = ref(db, `rooms/${roomId}/meta`);
    const snap = await get(metaRef);
    if (snap.exists()) {
      const meta = snap.val();
      const currentEnd = meta.timerEndTime || Date.now();
      await update(metaRef, {
        timerEndTime: currentEnd + 15000
      });
      showToast("Đã cộng thêm +15s vào đồng hồ pha!", "success");
    }
  };

  return (
    <div className="bg-[#0a0a0f] border-2 border-amber-500/80 rounded-2xl p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">
            GM AUTOMATION CENTER
          </h3>
        </div>
        <button
          onClick={onExportLogs}
          className="flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-xl transition"
        >
          <Download className="w-3 h-3 text-amber-400" />
          <span>Tải nhật ký</span>
        </button>
      </div>

      <div className="mb-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 flex items-center justify-between text-[11px] font-semibold text-amber-300">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          Cơ chế Quản trò tự động (Auto-GM) đang hoạt động!
        </span>
        <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
          TỰ ĐỘNG RUNNING
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {roomMeta?.phase === 'night' ? (
          <button
            onClick={onForceDay}
            className="flex items-center justify-center gap-1.5 bg-amber-900/40 hover:bg-amber-800/60 border border-amber-500/50 text-amber-200 font-bold text-[11px] py-2 rounded-xl transition"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Chuyển Sang Ngày</span>
          </button>
        ) : (
          <button
            onClick={onForceNight}
            className="flex items-center justify-center gap-1.5 bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-500/50 text-indigo-200 font-bold text-[11px] py-2 rounded-xl transition"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Chuyển Sang Đêm</span>
          </button>
        )}

        <button
          onClick={onTriggerMayor}
          className="flex items-center justify-center gap-1.5 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-200 font-bold text-[11px] py-2 rounded-xl transition"
        >
          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Bầu Trưởng Làng</span>
        </button>

        <button
          onClick={onResolveVote}
          className="flex items-center justify-center gap-1.5 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 font-bold text-[11px] py-2 rounded-xl transition"
        >
          <Scale className="w-3.5 h-3.5 text-rose-400" />
          <span>Chốt Biểu Quyết</span>
        </button>

        <button
          onClick={handleAddTime}
          className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-[11px] py-2 rounded-xl transition"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>+15s Thời Gian</span>
        </button>
      </div>
    </div>
  );
};
