import React, { useState } from 'react';
import { Player, RoleInfo } from '../types';
import { ALL_ROLES, PRESETS, FACTION_ICONS } from '../data/roles';
import { db, ref, update, getSynchronizedTimestamp } from '../services/firebase';
import { sound } from '../services/audio';
import { Search, Shuffle, Moon, Wand2 } from 'lucide-react';

interface RoleSetupProps {
  roomId: string | null;
  isHost: boolean;
  players: Player[];
  roleCounts: Record<string, number>;
  showToast: (msg: string, type?: 'info' | 'success' | 'danger' | 'warning') => void;
}

export const RoleSetup: React.FC<RoleSetupProps> = ({
  roomId,
  isHost,
  players,
  roleCounts,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedRoleInfo, setSelectedRoleInfo] = useState<RoleInfo | null>(null);
  const rolesPerPage = 6;

  const currentRoleCounts = roleCounts || {};
  const totalAllocated = (Object.values(currentRoleCounts) as number[]).reduce((a: number, b: number) => a + b, 0);
  const playerCount = players.length;

  // Filter roles
  const filteredRoles = ALL_ROLES.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / rolesPerPage));
  const pageRoles = filteredRoles.slice(currentPage * rolesPerPage, (currentPage + 1) * rolesPerPage);

  const handleQtyChange = (roleId: string, delta: number) => {
    if (!isHost || !roomId) return;
    sound.playSFX('click');
    const currentQty = currentRoleCounts[roleId] || 0;
    const newQty = Math.max(0, currentQty + delta);

    update(ref(db, `rooms/${roomId}/roleCounts`), {
      [roleId]: newQty
    });
  };

  const handleApplyPreset = (presetKey: string) => {
    if (!isHost || !roomId) return;
    sound.playSFX('click');
    const preset = PRESETS[presetKey];
    if (!preset) return;

    const updates: Record<string, any> = {};
    ALL_ROLES.forEach(r => {
      updates[`rooms/${roomId}/roleCounts/${r.id}`] = preset[r.id] || 0;
    });

    update(ref(db), updates);
    showToast(`Đã áp dụng cài đặt ${presetKey.toUpperCase()}!`, "success");
  };

  const handleAutoBalance = () => {
    if (!isHost || !roomId || playerCount === 0) return;
    sound.playSFX('click');
    
    // Calculate sum of special non-villager roles
    let specialCount = 0;
    Object.entries(currentRoleCounts).forEach(([rId, qty]) => {
      if (rId !== 'villager') specialCount += Number(qty);
    });

    let neededVillagers = Math.max(0, playerCount - specialCount);
    if (specialCount > playerCount) {
      // If special roles exceed player count, reset to classic preset
      handleApplyPreset('classic');
      return;
    }

    update(ref(db, `rooms/${roomId}/roleCounts`), {
      villager: neededVillagers
    });
    showToast(`Đã tự động cân bằng: ${neededVillagers} Dân Làng cho vừa đủ ${playerCount} người chơi!`, "success");
  };

  const handleDistributeAndStartGame = async () => {
    if (!isHost || !roomId) return;
    sound.playSFX('click');

    const activePlayers = players.filter(p => p.isConnected !== false);
    if (activePlayers.length < 3) {
      showToast("Cần tối thiểu 3 người chơi để bắt đầu ván đấu!", "warning");
      return;
    }

    // Auto balance villagers if needed
    if (totalAllocated !== activePlayers.length) {
      handleAutoBalance();
    }

    // Fetch fresh role counts
    let rolePool: string[] = [];
    ALL_ROLES.forEach(r => {
      const count = currentRoleCounts[r.id] || 0;
      for (let i = 0; i < count; i++) {
        rolePool.push(r.id);
      }
    });

    // If still mismatched, fallback to classic balance
    if (rolePool.length !== activePlayers.length) {
      const wolfCount = Math.max(1, Math.floor(activePlayers.length / 3));
      const seerCount = 1;
      const guardCount = activePlayers.length >= 5 ? 1 : 0;
      const villagerCount = activePlayers.length - wolfCount - seerCount - guardCount;

      rolePool = [];
      for (let i = 0; i < wolfCount; i++) rolePool.push(i === 0 ? 'wolfBoss' : 'wolf');
      for (let i = 0; i < seerCount; i++) rolePool.push('seer');
      for (let i = 0; i < guardCount; i++) rolePool.push('guard');
      for (let i = 0; i < villagerCount; i++) rolePool.push('villager');
    }

    // Fisher-Yates shuffle
    for (let i = rolePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rolePool[i], rolePool[j]] = [rolePool[j], rolePool[i]];
    }

    const updates: Record<string, any> = {};
    activePlayers.forEach((p, idx) => {
      const assignedRole = rolePool[idx];
      const isPassive = ALL_ROLES.find(r => r.id === assignedRole)?.passive;

      updates[`rooms/${roomId}/players/${p.id}/role`] = assignedRole;
      updates[`rooms/${roomId}/players/${p.id}/realFaction`] = ALL_ROLES.find(r => r.id === assignedRole)?.faction || 'villager';
      updates[`rooms/${roomId}/players/${p.id}/turnEnded`] = !!isPassive;
      updates[`rooms/${roomId}/players/${p.id}/hasSeenRole`] = false;
      updates[`rooms/${roomId}/players/${p.id}/alive`] = true;
      updates[`rooms/${roomId}/players/${p.id}/hasUsedHeal`] = false;
      updates[`rooms/${roomId}/players/${p.id}/hasUsedPoison`] = false;
      updates[`rooms/${roomId}/players/${p.id}/isIdiotRevealed`] = false;
      updates[`rooms/${roomId}/players/${p.id}/isPetroled`] = false;
      updates[`rooms/${roomId}/players/${p.id}/targetSelection`] = null;
    });

    updates[`rooms/${roomId}/wolf_votes`] = null;
    updates[`rooms/${roomId}/meta/started`] = true;
    updates[`rooms/${roomId}/meta/day`] = 1;
    updates[`rooms/${roomId}/meta/phase`] = "night";
    updates[`rooms/${roomId}/meta/timerEndTime`] = getSynchronizedTimestamp() + 45000;
    updates[`rooms/${roomId}/meta/timerDuration`] = 45;

    try {
      await update(ref(db), updates);
      showToast("🚀 Đã tự động phân phát vai trò & kích hoạt Đêm 1!", "success");
    } catch (err) {
      console.error(err);
      showToast("Lỗi khởi chạy trò chơi!", "danger");
    }
  };

  // Balance meter
  let villagePower = 0;
  let wolfPower = 0;
  let thirdPower = 0;

  ALL_ROLES.forEach(r => {
    const count = currentRoleCounts[r.id] || 0;
    if (count > 0) {
      if (r.faction === 'villager') villagePower += count;
      else if (r.faction === 'wolf') wolfPower += count;
      else if (r.faction === 'third') thirdPower += count;
    }
  });

  const totalPower = villagePower + wolfPower + thirdPower || 1;
  const vPct = (villagePower / totalPower) * 100;
  const wPct = (wolfPower / totalPower) * 100;
  const tPct = (thirdPower / totalPower) * 100;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] rounded-2xl border border-white/10 p-4 shadow-2xl text-left">
      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
        <h3 className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
          <span>ROLE CONFIGURATION</span>
          <span className="text-amber-400 font-mono text-xs">({totalAllocated}/{playerCount} người)</span>
        </h3>

        {totalAllocated !== playerCount && isHost && (
          <button
            onClick={handleAutoBalance}
            className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-xl transition"
          >
            <Wand2 className="w-3 h-3 text-amber-400" />
            <span>Tự cân bằng</span>
          </button>
        )}
      </div>

      {/* Balance Meter Bar */}
      <div className="bg-white/5 border border-white/5 rounded-xl p-3 mb-3">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
          TỶ LỆ LỰC LƯỢNG PHE CÁNH:
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
          <div style={{ width: `${wPct}%` }} className="bg-red-600 h-full transition-all" />
          <div style={{ width: `${tPct}%` }} className="bg-purple-600 h-full transition-all" />
          <div style={{ width: `${vPct}%` }} className="bg-emerald-600 h-full transition-all" />
        </div>
        <div className="text-[10px] text-center font-bold mt-1.5 text-amber-400 tracking-wider">
          {wolfPower > villagePower
            ? "🐺 Sói Áp Đảo (Game Nhanh)"
            : villagePower > wolfPower + thirdPower
            ? "🌾 Dân Làng Cân Bằng"
            : thirdPower > villagePower
            ? "🧛 Phe Thứ 3 Nguy Hiểm"
            : "⚖️ Tỷ Lệ Đạt Chuẩn"}
        </div>
      </div>

      {/* Preset Action */}
      <div className="mb-3">
        <button
          onClick={() => handleApplyPreset('classic')}
          className="w-full bg-gradient-to-r from-red-600/30 to-rose-600/30 hover:from-red-600/50 hover:to-rose-600/50 text-white text-[11px] font-black py-2.5 rounded-xl border border-red-500/40 uppercase tracking-[0.15em] transition shadow-lg flex items-center justify-center gap-2"
        >
          <span>🏆 CẤU HÌNH CLASSIC CHUẨN</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(0);
          }}
          placeholder="Tìm kiếm vai trò theo tên..."
          className="w-full bg-white/5 border border-white/10 focus:border-red-500 text-white rounded-xl pl-9 pr-3 py-2 text-xs outline-none transition"
        />
      </div>

      {/* Role Items List */}
      <div className="flex-1 min-h-[180px] bg-black/40 border border-white/5 rounded-xl p-2 overflow-y-auto space-y-1.5 mb-3">
        {pageRoles.map((r) => {
          const qty = currentRoleCounts[r.id] || 0;
          return (
            <div
              key={r.id}
              className="flex items-center justify-between bg-white/5 border border-white/5 px-3 py-2 rounded-xl text-xs"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <button
                  onClick={() => setSelectedRoleInfo(r)}
                  className="w-5 h-5 rounded-lg bg-white/10 text-amber-300 hover:bg-white/20 font-black text-[10px] flex items-center justify-center border border-white/10 shrink-0"
                >
                  ?
                </button>
                <span>{FACTION_ICONS[r.faction]}</span>
                <span className="font-bold text-slate-200 truncate">{r.name}</span>
              </div>

              {isHost && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleQtyChange(r.id, -1)}
                    className="w-6 h-6 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg font-bold text-xs flex items-center justify-center border border-white/10"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-bold text-red-400">{qty}</span>
                  <button
                    onClick={() => handleQtyChange(r.id, 1)}
                    className="w-6 h-6 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg font-bold text-xs flex items-center justify-center border border-white/10"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs font-bold mb-3">
        <button
          disabled={currentPage === 0}
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          className="bg-white/10 hover:bg-white/20 disabled:opacity-30 px-3 py-1.5 rounded-xl text-slate-200 transition"
        >
          &lt;
        </button>
        <span className="text-slate-500 font-mono text-[11px]">
          PAGE {currentPage + 1}/{totalPages}
        </span>
        <button
          disabled={currentPage >= totalPages - 1}
          onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
          className="bg-white/10 hover:bg-white/20 disabled:opacity-30 px-3 py-1.5 rounded-xl text-slate-200 transition"
        >
          &gt;
        </button>
      </div>

      {/* Host One-Click Launch */}
      {isHost && (
        <div className="space-y-2 pt-1">
          <button
            onClick={handleDistributeAndStartGame}
            className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition shadow-xl shadow-red-900/40"
          >
            <Moon className="w-4 h-4 text-amber-300" />
            <span>🚀 BẮT ĐẦU TRÒ CHƠI TỰ ĐỘNG</span>
          </button>
        </div>
      )}

      {/* Role Info Modal */}
      {selectedRoleInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#08080c] border border-white/10 rounded-2xl p-6 max-w-sm w-full text-left space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                <span>{FACTION_ICONS[selectedRoleInfo.faction]}</span>
                <span>{selectedRoleInfo.name}</span>
              </h3>
              <button
                onClick={() => setSelectedRoleInfo(null)}
                className="text-slate-500 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedRoleInfo.desc}
            </p>

            <button
              onClick={() => setSelectedRoleInfo(null)}
              className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider transition"
            >
              ĐÃ HIỂU
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
