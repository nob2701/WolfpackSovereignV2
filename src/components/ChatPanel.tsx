import React, { useState, useEffect, useRef } from 'react';
import { Player, RoomMeta, ChatMessage, ChatChannel } from '../types';
import { db, ref, push, onValue, getSynchronizedTimestamp } from '../services/firebase';
import { Send, MessageSquare, Lock, AtSign, Smile, Zap, X } from 'lucide-react';
import { ROLE_FACTIONS } from '../data/roles';

interface ChatPanelProps {
  myPlayer: Player | null;
  roomMeta: RoomMeta | null;
  roomId: string | null;
  players?: Player[];
  showToast: (msg: string, type?: 'info' | 'success' | 'danger' | 'warning') => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  myPlayer,
  roomMeta,
  roomId,
  players = [],
  showToast
}) => {
  const [activeChannel, setActiveChannel] = useState<ChatChannel>('public');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);
  
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const phase = roomMeta?.phase || 'setup';

  // Determine actual channel path in Firebase
  let channelPath: string = activeChannel;
  if (myPlayer && roomId) {
    if (activeChannel === 'wolf') channelPath = 'wolf';
    if (activeChannel === 'couple') channelPath = myPlayer.coupleId || `couple_${roomId}`;
    if (activeChannel === 'prime') channelPath = myPlayer.primeCovenantId || `prime_cov_${roomId}`;
    if (activeChannel === 'vampire') channelPath = myPlayer.vampireFactionId || `vampire_${roomId}`;
    if (activeChannel === 'reaper') channelPath = myPlayer.reaperFactionId || `reaper_${roomId}`;
  }

  useEffect(() => {
    if (!roomId) return;

    const chatRef = ref(db, `rooms/${roomId}/chats/${channelPath}`);
    const unsub = onValue(chatRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list: ChatMessage[] = Object.values(data);
      list.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(list);

      setTimeout(() => {
        if (chatBoxRef.current) {
          chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
      }, 50);
    });

    return () => unsub();
  }, [roomId, channelPath]);

  // Handle Input Changes & Mention Triggering
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    const lastAtIndex = val.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = val.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(' ')) {
        setMentionQuery(textAfterAt.toLowerCase());
        setShowMentionMenu(true);
        return;
      }
    }
    setShowMentionMenu(false);
    setMentionQuery(null);
  };

  const handleSelectMention = (player: Player) => {
    if (!inputText) {
      setInputText(`@${player.name} `);
    } else {
      const lastAtIndex = inputText.lastIndexOf('@');
      if (lastAtIndex !== -1) {
        const prefix = inputText.slice(0, lastAtIndex);
        setInputText(`${prefix}@${player.name} `);
      } else {
        setInputText(prev => `${prev}@${player.name} `);
      }
    }
    setShowMentionMenu(false);
    setMentionQuery(null);
    inputRef.current?.focus();
  };

  const handleSendMessage = async (textToSend?: string) => {
    const finalMsg = (textToSend || inputText).trim();
    if (!finalMsg || !roomId || !myPlayer) return;

    // Check mute
    if (phase === 'day' && myPlayer.isSilencerMuted && activeChannel === 'public') {
      showToast("Bạn đã bị Sói Câm Lặng khóa miệng hôm nay!", "danger");
      return;
    }

    if (phase === 'night' && activeChannel === 'public') {
      showToast("Màn đêm đã buông xuống! Hãy giữ im lặng ở kênh công khai.", "warning");
      return;
    }

    const msgPayload: ChatMessage = {
      senderName: myPlayer.name,
      senderId: myPlayer.id,
      text: finalMsg,
      timestamp: getSynchronizedTimestamp()
    };

    try {
      await push(ref(db, `rooms/${roomId}/chats/${channelPath}`), msgPayload);
      if (!textToSend) setInputText('');
      setShowMentionMenu(false);
      setShowEmojiPicker(false);
      setShowQuickPhrases(false);
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Filter players for @mention popup
  const mentionCandidates = players.filter(p => {
    if (!mentionQuery) return true;
    return p.name.toLowerCase().includes(mentionQuery);
  });

  // Helper to render message text with highlighted mentions
  const renderMessageText = (text: string) => {
    if (!text.includes('@')) return text;

    const parts = text.split(/(@[^\s]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const targetName = part.substring(1);
        const matchedPlayer = players.find(p => p.name.toLowerCase() === targetName.toLowerCase());
        if (matchedPlayer) {
          const isMyMention = myPlayer && matchedPlayer.id === myPlayer.id;
          return (
            <span
              key={i}
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 my-0.5 rounded-md font-bold text-[11px] border ${
                isMyMention
                  ? "bg-amber-500/30 text-amber-200 border-amber-400/50 animate-pulse"
                  : "bg-red-500/20 text-red-300 border-red-500/30"
              }`}
            >
              @{matchedPlayer.name}
            </span>
          );
        }
      }
      return part;
    });
  };

  // Visibility checks for channel tabs
  const isWolfPlayer = myPlayer && (myPlayer.realFaction === 'wolf' || ROLE_FACTIONS[myPlayer.role] === 'wolf');
  const showWolf = myPlayer && myPlayer.alive && isWolfPlayer;
  const showCouple = myPlayer && myPlayer.alive && (myPlayer.inCouple || !!myPlayer.coupleId);
  const showPrime = myPlayer && myPlayer.alive && (myPlayer.role === 'prime' || !!myPlayer.primeCovenantId);
  const showVampire = myPlayer && myPlayer.alive && (myPlayer.role === 'vampire' || !!myPlayer.vampireFactionId);
  const showGraveyard = myPlayer && !myPlayer.alive;

  const isPublicDisabled = (phase === 'night' && activeChannel === 'public') ||
    (phase === 'day' && myPlayer?.isSilencerMuted && activeChannel === 'public') ||
    (!myPlayer?.alive && activeChannel !== 'graveyard');

  const QUICK_PHRASES = [
    "🔮 Tôi là Tiên Tri!",
    "🛡️ Tôi là Bảo Vệ!",
    "🐺 Nghi ngờ Sói!",
    "✋ Tôi hoàn toàn vô tội!",
    "⚖️ Hãy bỏ phiếu kẻ này!",
    "💤 Đêm nay giữ im lặng"
  ];

  return (
    <div className="flex flex-col h-full bg-[#08080d] rounded-2xl border border-white/10 p-2.5 sm:p-3 shadow-2xl relative overflow-hidden min-h-0">
      
      {/* Header Title */}
      <div className="text-[11px] font-black text-red-500 uppercase tracking-wider mb-2 flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
        <span className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-red-400" />
          CHAT TRỰC TUYẾN
        </span>
        <span className="text-slate-400 font-medium text-[10px]">Gõ @ để tag</span>
      </div>

      {/* Channel Tabs Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-white/5 no-scrollbar mb-2 shrink-0">
        <button
          type="button"
          onClick={() => setActiveChannel('public')}
          className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl transition shrink-0 ${
            activeChannel === 'public'
              ? "bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md shadow-red-900/40"
              : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
          }`}
        >
          LÀNG 🌾
        </button>

        {showWolf && (
          <button
            type="button"
            onClick={() => setActiveChannel('wolf')}
            className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl transition shrink-0 ${
              activeChannel === 'wolf'
                ? "bg-red-950 text-red-200 border border-red-500 shadow-md"
                : "bg-red-950/30 border border-red-900/40 text-red-400"
            }`}
          >
            SÓI 🐺
          </button>
        )}

        {showCouple && (
          <button
            type="button"
            onClick={() => setActiveChannel('couple')}
            className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl transition shrink-0 ${
              activeChannel === 'couple'
                ? "bg-pink-950 text-pink-200 border border-pink-500 shadow-md"
                : "bg-pink-950/30 border border-pink-900/40 text-pink-400"
            }`}
          >
            ĐÔI 💘
          </button>
        )}

        {showPrime && (
          <button
            type="button"
            onClick={() => setActiveChannel('prime')}
            className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl transition shrink-0 ${
              activeChannel === 'prime'
                ? "bg-indigo-950 text-indigo-200 border border-indigo-500 shadow-md"
                : "bg-indigo-950/30 border border-indigo-900/40 text-indigo-400"
            }`}
          >
            KHẾ ƯỚC 🌌
          </button>
        )}

        {showVampire && (
          <button
            type="button"
            onClick={() => setActiveChannel('vampire')}
            className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl transition shrink-0 ${
              activeChannel === 'vampire'
                ? "bg-rose-950 text-rose-200 border border-rose-500 shadow-md"
                : "bg-rose-950/40 border border-rose-900/50 text-rose-400"
            }`}
          >
            MA CÀ RỒNG 🧛
          </button>
        )}

        {showGraveyard && (
          <button
            type="button"
            onClick={() => setActiveChannel('graveyard')}
            className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl transition shrink-0 ${
              activeChannel === 'graveyard'
                ? "bg-purple-950 text-purple-200 border border-purple-500 shadow-md"
                : "bg-purple-950/40 border border-purple-900/40 text-purple-400"
            }`}
          >
            NGHĨA TRANG 💀
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={chatBoxRef}
        className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 my-1 text-left font-sans no-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 text-xs italic py-10">
            Chưa có tin nhắn nào trong kênh này...
          </div>
        ) : (
          messages.map((m, idx) => {
            const isMe = myPlayer && m.senderId === myPlayer.id;
            const isMentionedMe = myPlayer && m.text.toLowerCase().includes(`@${myPlayer.name.toLowerCase()}`);

            return (
              <div
                key={m.timestamp + "_" + idx}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1 mb-0.5 px-0.5">
                  <span className={`text-[10px] font-extrabold ${isMe ? "text-red-400" : "text-slate-400"}`}>
                    {m.senderName}
                  </span>
                  <span className="text-[9px] text-slate-600 font-mono">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-2xl text-xs max-w-[88%] break-words leading-relaxed shadow-xs transition-all ${
                    isMe
                      ? "bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-tr-none font-medium"
                      : isMentionedMe
                      ? "bg-amber-950/80 text-amber-100 rounded-tl-none border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                      : "bg-white/10 text-slate-200 rounded-tl-none border border-white/5"
                  }`}
                >
                  {renderMessageText(m.text)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* @Mention Autocomplete Floating Menu */}
      {showMentionMenu && (
        <div className="absolute bottom-16 left-2 right-2 bg-[#12121c]/95 border border-amber-500/50 rounded-2xl shadow-2xl p-2 z-50 max-h-44 overflow-y-auto space-y-1 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
          <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <AtSign className="w-3 h-3" />
              <span>NHẮC TÊN NGƯỜI CHƠI</span>
            </span>
            <button
              type="button"
              onClick={() => setShowMentionMenu(false)}
              className="p-0.5 hover:bg-white/10 rounded-lg text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {mentionCandidates.length === 0 ? (
            <div className="text-[11px] text-slate-400 italic px-2 py-1">Không tìm thấy...</div>
          ) : (
            mentionCandidates.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectMention(p)}
                className="w-full text-left px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 text-xs font-semibold text-slate-200 flex items-center justify-between transition active:scale-98"
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${p.alive ? "bg-emerald-400" : "bg-red-500"}`}></span>
                  <span>{p.name}</span>
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${
                  p.alive ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-400"
                }`}>
                  {p.alive ? "SỐNG" : "CHẾT"}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Quick Preset Phrases Popover */}
      {showQuickPhrases && !isPublicDisabled && (
        <div className="absolute bottom-16 left-2 right-2 bg-[#12121c]/95 border border-red-500/40 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
          <div className="text-[10px] font-black text-red-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between border-b border-white/5 mb-1.5">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>CÂU NÓI NHANH</span>
            </span>
            <button
              type="button"
              onClick={() => setShowQuickPhrases(false)}
              className="p-0.5 hover:bg-white/10 rounded-lg text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_PHRASES.map((phrase, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setInputText(phrase);
                  setShowQuickPhrases(false);
                }}
                className="text-left text-[11px] font-semibold bg-white/5 hover:bg-red-500/20 text-slate-200 p-2 rounded-xl transition border border-white/5 active:scale-95"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && !isPublicDisabled && (
        <div className="absolute bottom-16 left-2 right-2 bg-[#12121c]/95 border border-white/20 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between gap-1">
            {["🔥", "🐺", "🔮", "💀", "⚖️", "🎯", "🤫", "🤝", "🔪", "👑"].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setInputText(prev => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-base transition active:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Input Controls Bar */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-white/10 shrink-0">
        {isPublicDisabled ? (
          <div className="w-full bg-red-950/30 border border-red-500/30 rounded-xl py-2 px-3 text-[11px] font-semibold text-rose-300 flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">Kênh chat đang bị khóa vào lúc này</span>
          </div>
        ) : (
          <>
            {/* Quick @ Button */}
            <button
              type="button"
              onClick={() => {
                setShowQuickPhrases(false);
                setShowEmojiPicker(false);
                setInputText(prev => prev.endsWith(" ") ? prev + "@" : prev ? prev + " @" : "@");
                setShowMentionMenu(true);
                inputRef.current?.focus();
              }}
              className="p-2 bg-white/5 hover:bg-amber-500/20 border border-white/10 text-amber-400 rounded-xl transition active:scale-95 shrink-0"
              title="Nhắc tên người chơi"
            >
              <AtSign className="w-4 h-4" />
            </button>

            {/* Quick Phrase Zap Button */}
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(false);
                setShowMentionMenu(false);
                setShowQuickPhrases(!showQuickPhrases);
              }}
              className={`p-2 border rounded-xl transition active:scale-95 shrink-0 ${
                showQuickPhrases 
                  ? "bg-red-500/30 border-red-500 text-red-300" 
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-rose-400"
              }`}
              title="Mẫu câu nói nhanh"
            >
              <Zap className="w-4 h-4" />
            </button>

            {/* Emoji Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setShowQuickPhrases(false);
                setShowMentionMenu(false);
                setShowEmojiPicker(!showEmojiPicker);
              }}
              className={`p-2 border rounded-xl transition active:scale-95 shrink-0 ${
                showEmojiPicker 
                  ? "bg-amber-500/30 border-amber-500 text-amber-200" 
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-amber-300"
              }`}
              title="Biểu tượng cảm xúc"
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Text Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn (gõ @)..."
              className="flex-1 bg-white/5 border border-white/10 focus:border-red-500 text-white rounded-xl px-2.5 py-2 text-xs outline-none transition min-w-0"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 disabled:opacity-40 text-white p-2 rounded-xl transition shadow-lg shadow-red-900/30 active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
