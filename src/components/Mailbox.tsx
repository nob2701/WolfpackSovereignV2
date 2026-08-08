import React, { useState } from 'react';
import { MailItem } from '../types';
import { db, ref, update } from '../services/firebase';
import { sound } from '../services/audio';
import { Mail, CheckCheck, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface MailboxProps {
  mailbox: Record<string, MailItem>;
  playerId: string | null;
  roomId: string | null;
  showToast: (msg: string, type?: 'info' | 'success' | 'danger' | 'warning') => void;
}

export const Mailbox: React.FC<MailboxProps> = ({
  mailbox,
  playerId,
  roomId,
  showToast
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'system' | 'role'>('all');
  const [selectedMailIndex, setSelectedMailIndex] = useState<number | null>(null);

  const mailsList = Object.values(mailbox || {}) as MailItem[];
  mailsList.sort((a, b) => b.timestamp - a.timestamp);

  const filteredMails = mailsList.filter(m => {
    if (activeCategory === 'all') return true;
    return m.category === activeCategory;
  });

  const unreadCount = mailsList.filter(m => !m.isRead).length;

  const handleOpenMail = (index: number) => {
    sound.playSFX('click');
    setSelectedMailIndex(index);
    const mail = filteredMails[index];
    if (mail && !mail.isRead && roomId && playerId) {
      update(ref(db, `rooms/${roomId}/players/${playerId}/mailbox/${mail.id}`), {
        isRead: true
      });
    }
  };

  const handleMarkReadAll = async () => {
    if (!roomId || !playerId || unreadCount === 0) return;
    sound.playSFX('click');
    const updates: Record<string, any> = {};
    mailsList.forEach(m => {
      if (!m.isRead) {
        updates[`rooms/${roomId}/players/${playerId}/mailbox/${m.id}/isRead`] = true;
      }
    });
    try {
      await update(ref(db), updates);
      showToast("Đã đọc tất cả mật thư hệ thống!", "success");
    } catch (err) {
      console.error(err);
    }
  };

  const selectedMail = selectedMailIndex !== null ? filteredMails[selectedMailIndex] : null;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] rounded-2xl border border-white/10 p-3.5 shadow-2xl text-left">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
        <h3 className="text-[11px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-amber-400" />
          <span>SYSTEM MAILBOX</span>
          {unreadCount > 0 && (
            <span className="bg-rose-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full animate-pulse">
              {unreadCount} MỚI
            </span>
          )}
        </h3>

        <button
          onClick={handleMarkReadAll}
          className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-xl transition border border-white/5"
        >
          <CheckCheck className="w-3 h-3 text-emerald-400" />
          <span>Đọc tất cả</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-1 mb-2 bg-[#050507] p-1 rounded-xl border border-white/5">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex-1 text-[10px] font-bold py-1 rounded-lg transition ${
            activeCategory === 'all'
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setActiveCategory('system')}
          className={`flex-1 text-[10px] font-bold py-1 rounded-lg transition ${
            activeCategory === 'system'
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Hệ thống
        </button>
        <button
          onClick={() => setActiveCategory('role')}
          className={`flex-1 text-[10px] font-bold py-1 rounded-lg transition ${
            activeCategory === 'role'
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Vai trò
        </button>
      </div>

      {/* Mail Items List */}
      <div className="flex-1 min-h-[180px] max-h-[320px] md:max-h-none bg-[#050507] border border-white/5 rounded-xl p-2 overflow-y-auto space-y-1.5">
        {filteredMails.length === 0 ? (
          <div className="text-center text-slate-500 text-xs italic py-10">
            Hòm thư hệ thống hiện đang trống...
          </div>
        ) : (
          filteredMails.map((mail, idx) => (
            <div
              key={mail.id}
              onClick={() => handleOpenMail(idx)}
              className={`p-2.5 rounded-xl border transition cursor-pointer relative ${
                !mail.isRead
                  ? "bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-950/30"
                  : "bg-white/[0.02] border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-100 truncate pr-4">
                  {mail.title}
                </span>
                <span className="text-[10px] font-mono font-bold">
                  {!mail.isRead ? <span className="text-rose-400 animate-pulse">● Mới</span> : <span className="text-slate-500">✓</span>}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {mail.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Vintage Parchment Scroll Modal */}
      {selectedMail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f4ecd8] text-[#2c1a04] border-8 double border-[#8d775a] rounded-2xl p-6 max-w-md w-full relative font-serif shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedMailIndex(null)}
              className="absolute top-3 right-3 text-[#4a2c00] hover:text-black transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-600 to-rose-900 border-2 border-amber-300 mx-auto shadow-md flex items-center justify-center text-amber-200 font-bold text-xs">
              📜
            </div>

            <h3 className="text-base font-bold text-center border-b border-dashed border-[#a08060] pb-2 text-[#4a2c00]">
              {selectedMail.title}
            </h3>

            <div className="text-xs leading-relaxed whitespace-pre-wrap min-h-[100px] py-2 text-[#2c1a04]">
              {selectedMail.content}
            </div>

            <div className="flex items-center justify-between border-t border-dashed border-[#a08060] pt-3 text-xs font-sans">
              <button
                disabled={selectedMailIndex === 0}
                onClick={() => handleOpenMail(selectedMailIndex - 1)}
                className="flex items-center gap-1 bg-[#e2e8f0] border border-[#cbd5e1] text-[#0f172a] px-3 py-1.5 rounded-xl disabled:opacity-40 font-bold transition"
              >
                <ChevronLeft className="w-4 h-4" /> Thư trước
              </button>

              <button
                disabled={selectedMailIndex === filteredMails.length - 1}
                onClick={() => handleOpenMail(selectedMailIndex + 1)}
                className="flex items-center gap-1 bg-[#e2e8f0] border border-[#cbd5e1] text-[#0f172a] px-3 py-1.5 rounded-xl disabled:opacity-40 font-bold transition"
              >
                Thư sau <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
