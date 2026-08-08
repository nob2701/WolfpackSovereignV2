import React, { useState, useEffect } from 'react';
import { Player, MVPData, RelationLog, LogItem } from '../../types';
import { getRoleName } from '../../data/roles';
import confetti from 'canvas-confetti';
import { Trophy, Map, ScrollText, RotateCcw } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  winner: string | null;
  mvpData: MVPData | null;
  relations: RelationLog[] | null;
  players: Player[];
  logs: LogItem[];
  onBackToLobby: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  winner,
  mvpData,
  relations,
  players,
  logs,
  onBackToLobby
}) => {
  const [activeTab, setActiveTab] = useState<'mvp' | 'map' | 'logs'>('mvp');

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  let title = "KẾT THÚC VÁN ĐẤU";
  let titleColor = "text-amber-400";
  let art = "🏆✨";

  if (winner === 'villager') {
    title = "🌾 DÂN LÀNG CHIẾN THẮNG 🌾";
    titleColor = "text-emerald-400";
    art = "🕊️☀️🌻";
  } else if (winner === 'wolf') {
    title = "🐺 MA SÓI CHIẾN THẮNG 🐺";
    titleColor = "text-rose-500";
    art = "🐺🩸🌑";
  } else if (winner === 'loneWolf') {
    title = "🐺 SÓI CÔ ĐỘC THẮNG ĐƠN LẬP 🐺";
    titleColor = "text-rose-600";
    art = "🐺🌕👑";
  } else if (winner === 'couple') {
    title = "💘 UYÊN ƯƠNG CHIẾN THẮNG 💘";
    titleColor = "text-pink-400";
    art = "💘👩‍❤️‍💋‍👨👑";
  } else if (winner === 'clown') {
    title = "🤡 GÃ HỀ THẮNG ĐƠN LẬP 🤡";
    titleColor = "text-amber-400";
    art = "🤡🎪🎭";
  } else if (winner === 'arsonist') {
    title = "🔥 KẺ PHÓNG HỎA THẮNG ĐƠN LẬP 🔥";
    titleColor = "text-orange-500";
    art = "🔥🛢️🏰";
  } else if (winner === 'serialKiller') {
    title = "🔪 SÁT NHÂN THẮNG ĐƠN LẬP 🔪";
    titleColor = "text-rose-600";
    art = "🔪🩸💀";
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121218] border-2 border-amber-500 rounded-2xl p-6 max-w-lg w-full text-center space-y-4 shadow-2xl">
        
        {/* Splash Title */}
        <div>
          <h1 className={`font-serif font-black text-xl sm:text-2xl tracking-wider uppercase ${titleColor}`}>
            {title}
          </h1>
          <div className="text-5xl py-2">{art}</div>
        </div>

        {/* Tabs Bar */}
        <div className="flex gap-1 bg-[#050507] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('mvp')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'mvp'
                ? "bg-amber-500 text-slate-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>🏆 MVP</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'map'
                ? "bg-amber-500 text-slate-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>🗺️ VAI TRÒ</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'logs'
                ? "bg-amber-500 text-slate-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>📜 NHẬT KÝ</span>
          </button>
        </div>

        {/* Tab 1: MVP Podium */}
        {activeTab === 'mvp' && (
          <div className="bg-[#050507] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="w-16 h-16 rounded-full border-2 border-amber-400 bg-amber-500/10 mx-auto flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {mvpData?.name || "Thần dân xuất sắc"}
              </h2>
              <span className="inline-block bg-amber-500 text-slate-950 font-bold text-[10px] px-2.5 py-0.5 rounded-full mt-1">
                {mvpData?.badge || "Chiến Binh Sống Sót"}
              </span>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-left">
              {(mvpData?.stats || []).map((s, i) => (
                <div key={i} className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">{s.label}:</span>
                  <strong className="text-amber-300">{s.value}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: All Unmasked Roles */}
        {activeTab === 'map' && (
          <div className="bg-[#050507] border border-slate-800 rounded-xl p-3 max-h-56 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {players.map(p => (
                <div key={p.id} className="bg-[#121218] border border-slate-800 p-2 rounded-lg text-left text-xs">
                  <div className="font-bold text-slate-200 truncate">{p.name}</div>
                  <div className="text-[10px] text-amber-400 font-medium">
                    ({getRoleName(p.role)})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Match Logs */}
        {activeTab === 'logs' && (
          <div className="bg-[#050507] border border-slate-800 rounded-xl p-3 max-h-56 overflow-y-auto text-left font-mono text-[11px] space-y-1.5 text-slate-400">
            {logs.map((l, i) => (
              <div key={i} className="leading-tight">
                <span className="text-amber-400">[Ngày {l.day} - {l.phase.toUpperCase()}] </span>
                <span>{l.msg}</span>
              </div>
            ))}
          </div>
        )}

        {/* Return Button */}
        <button
          onClick={onBackToLobby}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-950/40"
        >
          <RotateCcw className="w-4 h-4" />
          <span> Quay Về Sảnh Chờ</span>
        </button>
      </div>
    </div>
  );
};
