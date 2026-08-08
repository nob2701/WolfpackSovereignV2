import React, { useState } from 'react';
import { Player } from '../../types';
import { sound } from '../../services/audio';
import { Target, X, Check } from 'lucide-react';

interface TargetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: string;
  players: Player[];
  myPlayerId: string | null;
  hasUsedHeal?: boolean;
  hasUsedPoison?: boolean;
  onConfirm: (targetId: string | null, secondaryId?: string | null, modifier?: string | null, phrase?: string) => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'danger' | 'warning') => void;
}

export const TargetSelectorModal: React.FC<TargetSelectorModalProps> = ({
  isOpen,
  onClose,
  role,
  players,
  myPlayerId,
  hasUsedHeal,
  hasUsedPoison,
  onConfirm,
  showToast
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modifier, setModifier] = useState<string | null>(null);
  const [phrase, setPhrase] = useState('');

  if (!isOpen) return null;

  const multiTargetRoles = ["cupid", "phantomWolf", "eradicator", "manipulator", "prime", "arsonist"];
  const isMultiSelect = multiTargetRoles.includes(role);
  const maxSelections = isMultiSelect ? 2 : 1;

  // Filter valid targets
  let validTargets = players.filter(p => p.alive && p.id !== myPlayerId);
  if (role === 'doppelganger') {
    validTargets = players.filter(p => !p.alive && p.id !== myPlayerId);
  }

  const handleSelect = (id: string) => {
    sound.playSFX('click');
    if (isMultiSelect) {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(i => i !== id));
      } else {
        if (selectedIds.length < maxSelections) {
          setSelectedIds([...selectedIds, id]);
        } else {
          setSelectedIds([...selectedIds.slice(1), id]);
        }
      }
    } else {
      setSelectedIds([id]);
    }
  };

  const handleConfirmAction = () => {
    sound.playSFX('click');
    if (selectedIds.length === 0 && modifier !== 'ignite') {
      showToast("Vui lòng chọn mục tiêu!", "warning");
      return;
    }

    if (isMultiSelect && selectedIds.length < maxSelections) {
      showToast(`Kỹ năng yêu cầu chọn đủ ${maxSelections} mục tiêu!`, "warning");
      return;
    }

    if (role === 'parrot' && !phrase.trim()) {
      showToast("Vui lòng nhập lời thoại ép đối phương nhái!", "warning");
      return;
    }

    onConfirm(selectedIds[0] || null, isMultiSelect ? selectedIds[1] : null, modifier, phrase.trim());
    setSelectedIds([]);
    setModifier(null);
    setPhrase('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#101016] border border-amber-500/50 sm:rounded-2xl rounded-t-3xl rounded-b-none p-5 sm:p-6 max-w-md w-full text-left space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
        
        {/* Drag handle for mobile */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto sm:hidden mb-1"></div>

        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-xs sm:text-sm font-serif font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <span>CHỌN MỤC TIÊU HÀNH ĐỘNG</span>
          </h3>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-white font-bold p-1 rounded-lg bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isMultiSelect && (
          <p className="text-[11px] font-bold text-amber-400">
            Cần chọn đủ {maxSelections} mục tiêu ({selectedIds.length}/{maxSelections})
          </p>
        )}

        {/* Modifiers for Seer, Witch, Avenger, Chaos Wolf, Cat, Reaper, Arsonist */}
        {role === 'seer' && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setModifier('seer_scan')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                modifier === 'seer_scan' || !modifier
                  ? "bg-amber-500 border-amber-400 text-slate-950"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              🔮 Thấu Thị Phe
            </button>
            <button
              type="button"
              onClick={() => setModifier('seer_open_eye')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                modifier === 'seer_open_eye'
                  ? "bg-amber-500 border-amber-400 text-slate-950"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              👁️ Khai Nhãn Role
            </button>
          </div>
        )}

        {role === 'witch' && (
          <div className="flex gap-2">
            {!hasUsedHeal && (
              <button
                type="button"
                onClick={() => setModifier('heal')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                  modifier === 'heal' || !modifier
                    ? "bg-emerald-600 border-emerald-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-300"
                }`}
              >
                🧪 Bình Cứu
              </button>
            )}

            {!hasUsedPoison && (
              <button
                type="button"
                onClick={() => setModifier('poison')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                  modifier === 'poison'
                    ? "bg-rose-600 border-rose-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-300"
                }`}
              >
                ☠️ Bình Độc
              </button>
            )}
          </div>
        )}

        {role === 'avenger' && (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setModifier('avenger_haunt')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition ${
                modifier === 'avenger_haunt'
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              👻 Ám Ảnh (Sói)
            </button>
            <button
              type="button"
              onClick={() => setModifier('avenger_sleep') || setModifier('avenger_sleep')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition ${
                modifier === 'avenger_sleep' || !modifier
                  ? "bg-sky-600 border-sky-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              💤 Gây Mê
            </button>
            <button
              type="button"
              onClick={() => setModifier('avenger_execute')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition ${
                modifier === 'avenger_execute'
                  ? "bg-rose-600 border-rose-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              ⚔️ Phán Quyết
            </button>
          </div>
        )}

        {role === 'chaosWolf' && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-amber-300">Chọn quy tắc bị bẻ cong đêm nay:</p>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setModifier('chaos_seer')}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition ${
                  modifier === 'chaos_seer' || !modifier
                    ? "bg-purple-600 border-purple-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-300"
                }`}
              >
                🔮 Tiên Tri
              </button>
              <button
                type="button"
                onClick={() => setModifier('chaos_guard')}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition ${
                  modifier === 'chaos_guard'
                    ? "bg-emerald-600 border-emerald-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-300"
                }`}
              >
                🛡️ Bảo Vệ
              </button>
              <button
                type="button"
                onClick={() => setModifier('chaos_hunter')}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition ${
                  modifier === 'chaos_hunter'
                    ? "bg-rose-600 border-rose-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-300"
                }`}
              >
                🏹 Thợ Săn
              </button>
            </div>
          </div>
        )}

        {role === 'cat' && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setModifier('cat_claw')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                modifier === 'cat_claw' || !modifier
                  ? "bg-rose-600 border-rose-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              🐾 Xé Xác
            </button>
            <button
              type="button"
              onClick={() => setModifier('cat_seal')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                modifier === 'cat_seal'
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              ⛓️ Phong Ấn
            </button>
          </div>
        )}

        {role === 'reaper' && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setModifier('reaper_harvest')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                modifier === 'reaper_harvest' || !modifier
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              💀 Gặt Xác (Hồn)
            </button>
            <button
              type="button"
              onClick={() => setModifier('reaper_vote')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                modifier === 'reaper_vote'
                  ? "bg-amber-600 border-amber-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              🗳️ Chỉ Đạo Vote
            </button>
          </div>
        )}

        {role === 'arsonist' && (
          <div className="flex gap-2">
            <button
              onClick={() => setModifier('pour_petrol')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                modifier === 'pour_petrol' || !modifier
                  ? "bg-orange-600 border-orange-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              🛢️ Tẩm Xăng
            </button>
            <button
              onClick={() => setModifier('ignite')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                modifier === 'ignite'
                  ? "bg-rose-600 border-rose-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              🔥 Châm Lửa
            </button>
          </div>
        )}

        {role === 'parrot' && (
          <div>
            <input
              type="text"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="Nhập câu thoại ép mục tiêu nhái lại..."
              maxLength={50}
              className="w-full bg-[#050507] border border-slate-700 focus:border-amber-400 text-slate-100 rounded-xl px-3 py-2 text-xs outline-none transition"
            />
          </div>
        )}

        {/* Target Grid */}
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
          {validTargets.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-md"
                    : "bg-[#050507] border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <span className="truncate">{p.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleConfirmAction}
          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-rose-950/40"
        >
          🎯 XÁC NHẬN MỤC TIÊU
        </button>
      </div>
    </div>
  );
};
