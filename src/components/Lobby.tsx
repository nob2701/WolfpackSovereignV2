import React, { useState, useEffect, useRef } from 'react';
import { Player, RoomMeta } from '../types';
import { db, ref, set, get, update, verifyRoomPassword, getSynchronizedTimestamp } from '../services/firebase';
import { sound } from '../services/audio';
import { Copy, Users, Lock, Unlock, ArrowLeft, LogOut, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

interface LobbyProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  roomId: string | null;
  playerId: string | null;
  isHost: boolean;
  players: Player[];
  roomMeta: RoomMeta | null;
  onEnterGame: (roomId: string, playerId: string, isHost: boolean) => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'danger' | 'warning') => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  playerName,
  setPlayerName,
  roomId,
  playerId,
  isHost,
  players,
  roomMeta,
  onEnterGame,
  showToast
}) => {
  const [viewState, setViewState] = useState<'login' | 'join_code' | 'in_room'>('login');
  const [codeInputs, setCodeInputs] = useState<string[]>(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [roomPasswordCfg, setRoomPasswordCfg] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (roomId && playerId) {
      setViewState('in_room');
    } else {
      setViewState('login');
    }
  }, [roomId, playerId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.substring(0, 10);
    setPlayerName(val);
    localStorage.setItem('online_player_name', val);
  };

  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateRoom = async () => {
    if (playerName.trim().length < 2) {
      showToast("Tên người chơi phải từ 2 đến 10 ký tự!", "warning");
      return;
    }
    setIsSubmitting(true);
    sound.playSFX('click');

    const newRoomId = generateRoomCode();
    const newPlayerId = "host_" + Date.now();

    localStorage.setItem("reconnect_room_id", newRoomId);
    localStorage.setItem("reconnect_player_id", newPlayerId);

    const roomRef = ref(db, `rooms/${newRoomId}`);
    const hostData: Player = {
      id: newPlayerId,
      name: playerName.trim(),
      isHost: true,
      isReady: true,
      isConnected: true,
      alive: true,
      role: "villager",
      realFaction: "villager",
      turnEnded: false,
      hasSeenRole: false,
      joinedTime: getSynchronizedTimestamp()
    };

    const initialRoomState = {
      meta: {
        hostId: newPlayerId,
        roomId: newRoomId,
        password: roomPasswordCfg,
        phase: "setup",
        day: 0,
        started: false,
        createdTime: getSynchronizedTimestamp()
      },
      players: {
        [newPlayerId]: hostData
      },
      roleCounts: {
        villager: 1
      }
    };

    try {
      await set(roomRef, initialRoomState);
      showToast(`Tạo phòng ${newRoomId} thành công!`, "success");
      onEnterGame(newRoomId, newPlayerId, true);
    } catch (err) {
      console.error(err);
      showToast("Không thể khởi tạo phòng trên máy chủ!", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeInputChange = (index: number, val: string) => {
    const upper = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const newInputs = [...codeInputs];
    newInputs[index] = upper;
    setCodeInputs(newInputs);

    if (upper && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeInputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasteData = e.clipboardData.getData('text').trim().toUpperCase().substring(0, 6);
    if (/^[A-Z0-9]{6}$/.test(pasteData)) {
      e.preventDefault();
      const chars = pasteData.split('');
      setCodeInputs(chars);
      inputRefs.current[5]?.focus();
      showToast("Đã tự động điền mã phòng 6 ký tự!", "info");
    }
  };

  const handleJoinRoom = async () => {
    const code = codeInputs.join('');
    if (code.length !== 6) {
      showToast("Vui lòng nhập đủ mã phòng 6 ký tự!", "warning");
      return;
    }
    setIsSubmitting(true);
    sound.playSFX('click');

    const pwdCheck = await verifyRoomPassword(code, password);
    if (!pwdCheck.valid) {
      showToast(pwdCheck.reason || "Mật khẩu phòng chơi không chính xác!", "danger");
      setIsSubmitting(false);
      return;
    }

    const roomRef = ref(db, `rooms/${code}`);
    try {
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) {
        showToast("Mã phòng không tồn tại!", "danger");
        setIsSubmitting(false);
        return;
      }

      const roomData = snapshot.val();
      if (roomData.meta?.started) {
        showToast("Ván đấu đã bắt đầu, không thể gia nhập!", "danger");
        setIsSubmitting(false);
        return;
      }

      const newPlayerId = "player_" + Date.now();
      localStorage.setItem("reconnect_room_id", code);
      localStorage.setItem("reconnect_player_id", newPlayerId);

      const playerRef = ref(db, `rooms/${code}/players/${newPlayerId}`);
      const playerData: Player = {
        id: newPlayerId,
        name: playerName.trim(),
        isHost: false,
        isReady: false,
        isConnected: true,
        alive: true,
        role: "villager",
        realFaction: "villager",
        turnEnded: false,
        hasSeenRole: false,
        joinedTime: getSynchronizedTimestamp()
      };

      await set(playerRef, playerData);
      showToast(`Đã tham gia phòng ${code}!`, "success");
      onEnterGame(code, newPlayerId, false);
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi gia nhập phòng!", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleReady = async () => {
    if (!roomId || !playerId) return;
    const mySelf = players.find(p => p.id === playerId);
    if (!mySelf) return;

    sound.playSFX('click');
    try {
      await update(ref(db, `rooms/${roomId}/players/${playerId}`), {
        isReady: !mySelf.isReady
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleHostStartSetup = async () => {
    if (!roomId || !isHost) return;
    sound.playSFX('click');
    try {
      await update(ref(db, `rooms/${roomId}/meta`), {
        phase: "day",
        day: 0
      });
      showToast("Đã chuyển sang cấu hình vai trò!", "success");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveRoom = async () => {
    if (!roomId || !playerId) return;
    sound.playSFX('click');

    try {
      if (isHost) {
        const activePlayers = players.filter(p => p.id !== playerId && p.isConnected);
        if (activePlayers.length > 0) {
          activePlayers.sort((a, b) => a.joinedTime - b.joinedTime);
          const newHost = activePlayers[0];
          const updates: Record<string, any> = {};
          updates[`rooms/${roomId}/meta/hostId`] = newHost.id;
          updates[`rooms/${roomId}/players/${newHost.id}/isHost`] = true;
          updates[`rooms/${roomId}/players/${playerId}`] = null;
          await update(ref(db), updates);
        } else {
          await set(ref(db, `rooms/${roomId}`), null);
        }
      } else {
        await set(ref(db, `rooms/${roomId}/players/${playerId}`), null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("reconnect_room_id");
      localStorage.removeItem("reconnect_player_id");
      setViewState('login');
      window.location.reload();
    }
  };

  const handleCopyCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      showToast("Đã sao chép mã phòng!", "success");
    }
  };

  const isValidName = playerName.trim().length >= 2 && playerName.trim().length <= 10;
  const otherPlayers = players.filter(p => p.id !== playerId);
  const allReady = otherPlayers.length > 0 && otherPlayers.every(p => p.isReady);

  return (
    <div className="min-h-screen w-full bg-[#050508] text-slate-200 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white/[0.03] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        
        {/* Header Branding */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-900 shadow-lg shadow-red-900/30 flex items-center justify-center text-white text-2xl mb-3">
            🐺
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            WOLFPACK <span className="text-red-500">SOVEREIGN</span>
          </h1>
          <p className="text-[11px] uppercase tracking-widest text-slate-500 mt-1">
            Hệ Thống Đấu Ma Sói Đa Nền Tảng v47.0
          </p>
        </div>

        {/* View 1: Login Form */}
        {viewState === 'login' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-red-500 mb-2">
                PLAYER DISPLAY NAME
              </label>
              <input
                type="text"
                value={playerName}
                onChange={handleNameChange}
                placeholder="Nhập biệt danh của bạn (2-10 ký tự)..."
                maxLength={10}
                className="w-full bg-white/5 border border-white/10 focus:border-red-500 text-white rounded-xl px-4 py-3.5 text-sm outline-none transition"
              />
            </div>

            <div className="pt-2 space-y-3">
              <button
                disabled={!isValidName || isSubmitting}
                onClick={() => setViewState('join_code')}
                className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl text-sm tracking-[0.15em] uppercase transition shadow-xl shadow-red-900/40"
              >
                JOIN ROOM
              </button>

              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 border-t border-white/5"></div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">OR</span>
                <div className="flex-1 border-t border-white/5"></div>
              </div>

              <button
                disabled={!isValidName || isSubmitting}
                onClick={handleCreateRoom}
                className="w-full bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl text-sm tracking-wider uppercase transition border border-white/10"
              >
                CREATE NEW ROOM
              </button>
            </div>
          </div>
        )}

        {/* View 2: Join Code Form */}
        {viewState === 'join_code' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setViewState('login')}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại</span>
              </button>
              <span className="text-xs font-semibold uppercase tracking-widest text-red-500">
                Nhập mã 6 ký tự
              </span>
              <div className="w-16"></div>
            </div>

            <div className="flex justify-between gap-1.5 py-2" onPaste={handlePaste}>
              {codeInputs.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleCodeInputChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-14 text-center font-mono font-bold text-xl bg-white/5 border-2 border-white/10 focus:border-red-500 text-white rounded-xl outline-none transition uppercase shadow-inner"
                />
              ))}
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu phòng (để trống nếu công khai)..."
                maxLength={12}
                className="w-full bg-white/5 border border-white/10 focus:border-red-500 text-white rounded-xl px-4 py-3 text-xs outline-none transition"
              />
            </div>

            <button
              disabled={codeInputs.join('').length !== 6 || isSubmitting}
              onClick={handleJoinRoom}
              className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl text-sm tracking-[0.15em] uppercase transition shadow-xl shadow-red-900/40"
            >
              XÁC NHẬN GIA NHẬP
            </button>
          </div>
        )}

        {/* View 3: In-Room Status */}
        {viewState === 'in_room' && (
          <div className="space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">ROOM ID</span>
                <span className="font-mono text-2xl font-black text-white tracking-wider">
                  #{roomId}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 text-xs px-3 py-2 rounded-xl transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </button>
            </div>

            {/* Players List */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-red-500" />
                  <span>PLAYERS ({players.length}):</span>
                </span>
                {roomMeta?.password ? (
                  <span className="text-[10px] text-amber-400 flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold">
                    <Lock className="w-3 h-3" /> Mật khẩu
                  </span>
                ) : (
                  <span className="text-[10px] text-green-400 flex items-center gap-1 bg-green-500/20 border border-green-500/30 px-2.5 py-0.5 rounded-full font-bold">
                    <Unlock className="w-3 h-3" /> Công khai
                  </span>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-white/5 border border-white/5 px-3 py-2.5 rounded-xl text-xs"
                  >
                    <span className="font-bold text-slate-200 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">👤</div>
                      <span>{p.name}</span>
                      {p.isHost && <span className="text-amber-400">👑</span>}
                      {p.id === playerId && <span className="text-[10px] text-slate-500">(Bạn)</span>}
                    </span>

                    {p.isHost ? (
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                        Game Master
                      </span>
                    ) : p.isReady ? (
                      <span className="bg-green-500/20 text-green-400 border border-green-500/30 font-bold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 uppercase tracking-wider">
                        <CheckCircle className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 animate-pulse uppercase tracking-wider">
                        <Clock className="w-3 h-3" /> Waiting
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Host Controls */}
            {isHost && (
              <div className="space-y-2 pt-1">
                <button
                  disabled={!allReady}
                  onClick={handleHostStartSetup}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl text-sm tracking-[0.15em] uppercase transition shadow-xl shadow-red-900/40"
                >
                  TIẾN HÀNH TRÒ CHƠI
                </button>
                <p className="text-[10px] text-center text-slate-500 italic">
                  {!allReady ? "(Cần tất cả người chơi Sẵn Sàng để bắt đầu)" : "(Tất cả đã Sẵn Sàng!)"}
                </p>
              </div>
            )}

            {/* Player Controls */}
            {!isHost && (
              <button
                onClick={handleToggleReady}
                className={`w-full font-black py-4 rounded-2xl text-sm tracking-[0.15em] uppercase transition shadow-xl ${
                  players.find(p => p.id === playerId)?.isReady
                    ? "bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10"
                    : "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-red-900/40"
                }`}
              >
                {players.find(p => p.id === playerId)?.isReady ? "HỦY SẴN SÀNG" : "ĐÃ SẴN SÀNG (READY!)"}
              </button>
            )}

            {/* Leave Button */}
            <button
              onClick={handleLeaveRoom}
              className="w-full border border-red-500/20 text-red-400 hover:bg-red-500/10 font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>RỜI KHỎI PHÒNG</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
