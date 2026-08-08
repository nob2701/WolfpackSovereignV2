import React from 'react';
import { Player, RoomMeta } from '../types';
import { db, ref, update } from '../services/firebase';
import { sound } from '../services/audio';
import { PASSIVE_ROLES, ROLE_ICONS } from '../data/roles';
import { Sparkles, Moon, Scale } from 'lucide-react';

interface ActionCenterProps {
  myPlayer: Player | null;
  roomMeta: RoomMeta | null;
  onOpenTargetSelector: () => void;
  onOpenNominateSelector: () => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'danger' | 'warning') => void;
}

export const ActionCenter: React.FC<ActionCenterProps> = ({
  myPlayer,
  roomMeta,
  onOpenTargetSelector,
  onOpenNominateSelector,
  showToast
}) => {
  if (!myPlayer) return null;

  const phase = roomMeta?.phase || 'setup';

  const handleEndTurn = async () => {
    if (!myPlayer || !roomMeta?.roomId) return;
    sound.playSFX('click');
    try {
      await update(ref(db, `rooms/${roomMeta.roomId}/players/${myPlayer.id}`), {
        turnEnded: true
      });
      showToast("Đã xong lượt đi đêm! Chúc bạn ngủ ngon...", "success");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 mt-auto text-center shadow-2xl backdrop-blur-md">
      <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">
        ACTION CENTER
      </div>
      <p className="text-xs font-semibold text-slate-300 mb-4 min-h-[18px]">
        {phase === 'night'
          ? "Đêm tối bao phủ... Thần dân và muông thú hãy nhắm mắt đi ngủ!"
          : "Bình minh hé rạng! Thảo luận tự do vạch mặt kẻ thù."}
      </p>

      {/* Dynamic Action Buttons */}
      <div className="flex flex-col gap-3">
        {phase === 'night' && (
          <>
            {!myPlayer.alive ? (
              <p className="text-xs text-slate-500 italic">
                Bạn đã hy sinh. Theo dõi diễn biến ván đấu dưới dạng linh hồn...
              </p>
            ) : myPlayer.turnEnded ? (
              <div className="flex items-center justify-center gap-2 py-3 text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 rounded-2xl animate-pulse">
                <Moon className="w-4 h-4 text-green-400" />
                <span>Đã xong lượt! Đang ngủ say chờ ngày hé rạng...</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {(!PASSIVE_ROLES.includes(myPlayer.role) || myPlayer.realFaction === 'wolf' || myPlayer.role === 'wolf' || myPlayer.role === 'wolfBoss' || myPlayer.role === 'loneWolf') ? (
                  <button
                    onClick={onOpenTargetSelector}
                    className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition shadow-xl shadow-red-900/40 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {ROLE_ICONS[myPlayer.role] || "🔮"} KÍCH HOẠT KỸ NĂNG ĐÊM
                    </span>
                  </button>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Bạn thuộc vai trò thụ động ban đêm. Hãy yên lặng đi ngủ.
                  </p>
                )}

                <button
                  onClick={handleEndTurn}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition border border-white/10"
                >
                  <Moon className="w-4 h-4 text-slate-300" />
                  <span>💤 XÁC NHẬN KẾT THÚC LƯỢT</span>
                </button>
              </div>
            )}
          </>
        )}

        {phase === 'day' && myPlayer.alive && (
          <button
            onClick={onOpenNominateSelector}
            className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition shadow-xl shadow-red-900/40"
          >
            <Scale className="w-4 h-4" />
            <span>⚖️ ĐỀ CỬ NGHỊ VIÊN LÊN ĐÀI BIỆN HỘ</span>
          </button>
        )}
      </div>
    </div>
  );
};
