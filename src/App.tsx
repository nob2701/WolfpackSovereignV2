import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, RoomMeta, TrialState, LogItem, MailItem, ChatChannel } from './types';
import { getRoleName } from './data/roles';
import { db, ref, onValue, get, update, set, push, getSynchronizedTimestamp } from './services/firebase';
import { TickEngine } from './services/tickEngine';
import { sound } from './services/audio';

import { Lobby } from './components/Lobby';
import { HeaderBar } from './components/HeaderBar';
import { PlayerGrid } from './components/PlayerGrid';
import { IdentityCard } from './components/IdentityCard';
import { GMConsole } from './components/GMConsole';
import { ActionCenter } from './components/ActionCenter';
import { TrialStage } from './components/TrialStage';
import { ChatPanel } from './components/ChatPanel';
import { Mailbox } from './components/Mailbox';
import { RoleSetup } from './components/RoleSetup';
import { SpectatorWidget } from './components/SpectatorWidget';

import { TargetSelectorModal } from './components/Modals/TargetSelectorModal';
import { HunterRevengeModal } from './components/Modals/HunterRevengeModal';
import { MayorElectionModal } from './components/Modals/MayorElectionModal';
import { GavelOverlay } from './components/Modals/GavelOverlay';
import { VictoryModal } from './components/Modals/VictoryModal';
import { BottomSheet } from './components/Modals/BottomSheet';
import { SettingsModal } from './components/Modals/SettingsModal';
import { NightSleepOverlay } from './components/NightSleepOverlay';

import { Users, Settings as SettingsIcon, Gamepad2, ScrollText, MessageSquare } from 'lucide-react';

export default function App() {
  // Navigation & User
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('online_player_name') || '');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [mobileTab, setMobileTab] = useState<number>(3); // 1: Arena, 2: Roles, 3: Board, 4: Log, 5: Chat

  // Room Realtime State
  const [roomMeta, setRoomMeta] = useState<RoomMeta | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [trial, setTrial] = useState<TrialState | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [mailbox, setMailbox] = useState<Record<string, MailItem>>({});
  const [votes, setVotes] = useState<Record<string, string> | null>(null);
  const [wolfVotesMap, setWolfVotesMap] = useState<Record<string, number>>({});

  // Active Modals & Overlays
  const [activeChannel, setActiveChannel] = useState<ChatChannel>('public');
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isHunterModalOpen, setIsHunterModalOpen] = useState(false);
  const [isMayorModalOpen, setIsMayorModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedSheetPlayer, setSelectedSheetPlayer] = useState<Player | null>(null);
  const [gavelVerdictText, setGavelVerdictText] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ msg: string; type: string } | null>(null);

  // Left & Right Drawers for Mobile
  const [showLeftDrawer, setShowLeftDrawer] = useState(false);
  const [showRightDrawer, setShowRightDrawer] = useState(false);

  // Toast Helper
  const showToast = (msg: string, type: 'info' | 'success' | 'danger' | 'warning' = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Reconnection Check
  useEffect(() => {
    const savedRoom = localStorage.getItem('reconnect_room_id');
    const savedPlayer = localStorage.getItem('reconnect_player_id');
    if (savedRoom && savedPlayer) {
      get(ref(db, `rooms/${savedRoom}/players/${savedPlayer}`)).then(snap => {
        if (snap.exists()) {
          setRoomId(savedRoom);
          setPlayerId(savedPlayer);
          setIsHost(snap.val().isHost);
          setPlayerName(snap.val().name);
        }
      });
    }
  }, []);

  // Realtime Listeners
  useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    const unsub = onValue(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        showToast("Phòng chơi không tồn tại hoặc đã bị hủy!", "danger");
        setRoomId(null);
        setPlayerId(null);
        return;
      }

      const data = snapshot.val();
      setRoomMeta(data.meta || null);
      setRoleCounts(data.roleCounts || {});
      setTrial(data.trial || null);
      setVotes(data.votes || null);

      const pList: Player[] = Object.values(data.players || {});
      setPlayers(pList);

      if (playerId && data.players[playerId]) {
        setIsHost(data.players[playerId].isHost);
      }

      // Wolf Votes Map
      const wVotesNode = data.wolf_votes || {};
      const wCounts: Record<string, number> = {};
      Object.values(wVotesNode).forEach((tid: any) => {
        if (tid && typeof tid === 'string') wCounts[tid] = (wCounts[tid] || 0) + 1;
      });
      setWolfVotesMap(wCounts);

      // Mailbox & Logs
      if (playerId && data.players[playerId]?.mailbox) {
        setMailbox(data.players[playerId].mailbox);
      }
      if (data.logs) {
        const lList: LogItem[] = Object.values(data.logs);
        lList.sort((a, b) => b.timestamp - a.timestamp);
        setLogs(lList);
      }
    });

    return () => unsub();
  }, [roomId, playerId]);

  // Phase Timer Sync & Expiration Handling
  useEffect(() => {
    if (!roomMeta?.timerEndTime || !roomMeta?.timerDuration) return;

    const interval = setInterval(() => {
      const serverNow = getSynchronizedTimestamp();
      const remainingMs = Math.max(0, roomMeta.timerEndTime! - serverNow);
      const remainingSec = Math.ceil(remainingMs / 1000);

      const mins = Math.floor(remainingSec / 60);
      const secs = remainingSec % 60;

      const display = document.getElementById("phase-timer-display");
      const bar = document.getElementById("phase-timer-bar");

      if (display) {
        display.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      if (bar) {
        const pct = Math.max(0, (remainingMs / (roomMeta.timerDuration! * 1000)) * 100);
        bar.style.width = `${pct}%`;
      }

      // Timer Expiry Trigger (Host only)
      if (remainingMs <= 0 && isHost && roomMeta.roomId) {
        clearInterval(interval);
        handlePhaseTimerExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roomMeta?.timerEndTime, roomMeta?.timerDuration, isHost]);

  const handlePhaseTimerExpired = async () => {
    if (!roomId || !isHost || !roomMeta) return;

    if (roomMeta.phase === 'night') {
      showToast("Hết giờ Đêm đen! Đang chuyển sang Ban Ngày...", "warning");
      handleTransitionToDay();
    } else if (roomMeta.phase === 'day') {
      if (trial?.stage === 'mayor_election') {
        resolveMayorElection();
      } else if (trial?.stage === 'defense') {
        update(ref(db, `rooms/${roomId}/trial`), { stage: 'vote' });
      } else if (trial?.stage === 'vote') {
        resolveVotingOutcome();
      } else {
        showToast("Màn đêm dần buông xuống... Tất cả thần dân đi ngủ.", "info");
        handleTransitionToNight();
      }
    }
  };

  const handleTransitionToNight = async () => {
    if (!roomId || !isHost) return;
    sound.playSFX('night_howl');
    const nextDay = (roomMeta?.day || 1) + 1;
    const updates: Record<string, any> = {};

    players.forEach(p => {
      updates[`rooms/${roomId}/players/${p.id}/targetSelection`] = null;
      updates[`rooms/${roomId}/players/${p.id}/turnEnded`] = false;
    });
    updates[`rooms/${roomId}/wolf_votes`] = null;
    updates[`rooms/${roomId}/votes`] = null;
    updates[`rooms/${roomId}/trial`] = { stage: 'none', accusedId: null };

    updates[`rooms/${roomId}/meta/phase`] = "night";
    updates[`rooms/${roomId}/meta/day`] = nextDay;
    updates[`rooms/${roomId}/meta/timerEndTime`] = getSynchronizedTimestamp() + 45000;
    updates[`rooms/${roomId}/meta/timerDuration`] = 45;

    await update(ref(db), updates);

    push(ref(db, `rooms/${roomId}/logs`), {
      day: nextDay,
      phase: 'night',
      msg: `🌙 Màn đêm thứ ${nextDay} giăng xuống! Tất cả thần dân nhắm mắt đi ngủ. Các vai trò bí mật thức giấc...`,
      type: 'warning',
      timestamp: getSynchronizedTimestamp()
    });
  };

  const handleTransitionToDay = async () => {
    if (!roomId || !isHost) return;
    sound.playSFX('morning_rooster');

    const resolutionOutcome = await TickEngine.resolveNightActions(roomId);
    const updates: Record<string, any> = {};

    resolutionOutcome.deaths.forEach(deadId => {
      updates[`rooms/${roomId}/players/${deadId}/alive`] = false;
    });

    for (const [pId, fields] of Object.entries(resolutionOutcome.playerStateUpdates)) {
      for (const [fKey, val] of Object.entries(fields)) {
        updates[`rooms/${roomId}/players/${pId}/${fKey}`] = val;
      }
    }

    for (const [pId, mails] of Object.entries(resolutionOutcome.mailboxDeliveries)) {
      for (const mail of mails) {
        const mailId = "mail_" + getSynchronizedTimestamp() + "_" + Math.random().toString(36).substring(2, 7);
        updates[`rooms/${roomId}/players/${pId}/mailbox/${mailId}`] = {
          id: mailId,
          title: mail.title,
          content: mail.content,
          category: mail.category || "role",
          isRead: false,
          timestamp: getSynchronizedTimestamp()
        };
      }
    }

    updates[`rooms/${roomId}/meta/phase`] = "day";
    updates[`rooms/${roomId}/meta/timerEndTime`] = getSynchronizedTimestamp() + 90000;
    updates[`rooms/${roomId}/meta/timerDuration`] = 90;

    await update(ref(db), updates);

    let ann = resolutionOutcome.deaths.length === 0
      ? "☀️ Bình minh rạng rỡ! Đêm qua vương quốc bình yên, không ai bị hại."
      : `☀️ Bình minh rạng rỡ! Đêm qua ghi nhận ${resolutionOutcome.deaths.length} người tử vong.`;

    push(ref(db, `rooms/${roomId}/logs`), {
      day: roomMeta?.day || 1,
      phase: 'day',
      msg: ann,
      type: 'info',
      timestamp: getSynchronizedTimestamp()
    });
  };

  const resolveMayorElection = async () => {
    if (!roomId || !isHost) return;
    const snap = await get(ref(db, `rooms/${roomId}/mayor_votes`));
    const mVotes = snap.val() || {};
    const counts: Record<string, number> = {};

    Object.values(mVotes).forEach((candId: any) => {
      if (candId && candId !== 'skip') {
        counts[candId] = (counts[candId] || 0) + 1;
      }
    });

    let topCands: string[] = [];
    let maxV = 0;
    Object.entries(counts).forEach(([cid, cnt]) => {
      if (cnt > maxV) {
        maxV = cnt;
        topCands = [cid];
      } else if (cnt === maxV && maxV > 0) {
        topCands.push(cid);
      }
    });

    const winnerId = topCands.length > 0 ? topCands[0] : null;
    const updates: Record<string, any> = {
      [`rooms/${roomId}/trial`]: { stage: 'none', accusedId: null },
      [`rooms/${roomId}/mayor_votes`]: null
    };

    if (winnerId) {
      updates[`rooms/${roomId}/meta/mayorId`] = winnerId;
      await update(ref(db), updates);
      showToast(`👑 Thần dân [${players.find(p => p.id === winnerId)?.name}] trúng cử TRƯỞNG LÀNG!`, "success");
    } else {
      await update(ref(db), updates);
      showToast("👑 Không ai trúng cử Trưởng Làng!", "info");
    }
  };

  const resolveVotingOutcome = async () => {
    if (!roomId || !isHost || !trial?.accusedId) return;
    sound.playSFX('gavel_strike');

    let countAcquit = 0;
    let countExecute = 0;
    const mayorId = roomMeta?.mayorId;

    Object.entries(votes || {}).forEach(([voterId, val]) => {
      const voter = players.find(p => p.id === voterId);
      if (voter && voter.alive && !voter.isIdiotRevealed) {
        const weight = voterId === mayorId ? 2 : 1;
        if (val === 'ACQUIT') countAcquit += weight;
        if (val === 'EXECUTE') countExecute += weight;
      }
    });

    const accused = players.find(p => p.id === trial.accusedId);
    const accusedName = accused?.name || "Bị cáo";
    let text = "";
    let executeTarget = false;

    if (countExecute > countAcquit) {
      text = `BẢN ÁN TỬ HÌNH DÀNH CHO: ${accusedName.toUpperCase()}!`;
      executeTarget = true;
    } else {
      text = `${accusedName.toUpperCase()} ĐÃ ĐƯỢC THA BỔNG THÀNH CÔNG!`;
    }

    setGavelVerdictText(text);

    setTimeout(async () => {
      setGavelVerdictText(null);
      const updates: Record<string, any> = {
        [`rooms/${roomId}/trial`]: { stage: 'none', accusedId: null },
        [`rooms/${roomId}/votes`]: null
      };

      if (executeTarget) {
        if (accused?.role === 'idiot') {
          updates[`rooms/${roomId}/players/${trial.accusedId}/isIdiotRevealed`] = true;
          showToast(`🤡 [${accusedName}] lật thẻ NGỐC! Không bị tử hình nhưng mất quyền vote.`, "warning");
        } else {
          updates[`rooms/${roomId}/players/${trial.accusedId}/alive`] = false;
          if (accused?.role === 'hunter') {
            setIsHunterModalOpen(true);
          }
        }
      }

      await update(ref(db), updates);
    }, 2500);
  };

  const myPlayer = players.find(p => p.id === playerId) || null;

  // Auto advance night phase when ALL active living connected players have ended their turn
  useEffect(() => {
    if (!isHost || !roomId || roomMeta?.phase !== 'night') return;
    const livingPlayers = players.filter(p => p.alive && p.isConnected !== false);
    if (livingPlayers.length > 0 && livingPlayers.every(p => p.turnEnded)) {
      const timer = setTimeout(() => {
        handleTransitionToDay();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [players, roomMeta?.phase, isHost, roomId]);

  // Helper to generate precise role instant popup
  const getRoleInstantPopup = (
    role: string,
    modifier: string | null | undefined,
    targetA: string,
    targetB: string,
    phrase: string | undefined,
    targetAPlayer: Player | undefined,
    targetBPlayer: Player | undefined
  ): string => {
    if (role === 'seer') {
      if (modifier === 'seer_open_eye') {
        const realRole = targetAPlayer ? getRoleName(targetAPlayer.role) : "Dân Làng";
        const factionName = targetAPlayer?.realFaction === 'wolf' ? 'Phe Ma Sói 🐺' : targetAPlayer?.realFaction === 'third' ? 'Phe Thứ Ba 🧛' : 'Phe Dân Làng 🌾';
        return `Hào quang Khai Nhãn đã xuyên qua mọi lớp ngụy trang! Vai trò thực sự của ${targetA} là: ${realRole} (${factionName}).`;
      } else {
        const factionStr = targetAPlayer?.realFaction === 'wolf' ? 'PHE MA SÓI 🐺' : 'PHE DÂN LÀNG 🌾';
        return `Phép thuật hoàn tất! Quả cầu pha lê hiển thị linh hồn của ${targetA} thuộc về: [${factionStr}].`;
      }
    }

    if (role === 'guard') {
      return `Lá chắn thép đã được dựng lên thành công xung quanh ${targetA}. Kẻ này sẽ miễn nhiễm với mọi đòn sát thương vật lý đêm nay.`;
    }

    if (role === 'witch') {
      if (modifier === 'poison') {
        return `Độc dược đã được ném! ${targetA} sẽ không thể nhìn thấy ánh mặt trời ngày mai.`;
      }
      return `Hồi sinh thành công! Linh hồn của ${targetA} đã được kéo ngược từ cửa tử thần.`;
    }

    if (role === 'hunter') {
      return `Hồng tâm đã khóa chặt vào đầu của ${targetA}. Nếu bạn bị hạ sát, phát súng cuối cùng sẽ tự động kích nổ tiêu diệt kẻ này.`;
    }

    if (role === 'cupid') {
      return `Sợi tơ hồng định mệnh đã được thắt chặt giữa ${targetA} và ${targetB}. Tình yêu của họ sẽ định đoạt ván cờ này!`;
    }

    if (role === 'angel') {
      return `Ánh sáng thánh khiết đã gột rửa toàn bộ tà khí, bùa chú bất lợi khỏi linh hồn của ${targetA}.`;
    }

    if (role === 'parrot') {
      return `Đã gửi lời nguyền nhại giọng thành công lên ${targetA}. Sáng mai họ sẽ phải phát ngôn câu nói này!`;
    }

    if (role === 'carver') {
      return `Đã ghi danh ${targetA} vào Sổ Sinh Tử. Lời nguyền phản sát rình rập quanh kẻ này.`;
    }

    if (role === 'guarantor') {
      return `Đã thiết lập quyền Bảo Lãnh tuyệt đối cho ${targetA}. Kẻ này sẽ không thể bị treo cổ vào ngày mai.`;
    }

    if (role === 'reflector') {
      return `Tấm gương phản chiếu năng lượng đã được dựng trước cửa nhà ${targetA}. Kẻ nào dùng phép xấu lên họ sẽ bị gánh chịu hậu quả tương tự.`;
    }

    if (role === 'avenger') {
      if (modifier === 'avenger_haunt') return `Đã rải tà khí Ám Ảnh quanh bầy sói thông qua mục tiêu ${targetA}.`;
      if (modifier === 'avenger_sleep') return `Đã tiêm thuốc mê vào mục tiêu ${targetA}. Đêm mai họ sẽ ngủ say mất lượt!`;
      return `Lưỡi gươm phán quyết đã hạ xuống đầu ${targetA}.`;
    }

    if (role === 'wolf' || role === 'wolfBoss' || role === 'loneWolf') {
      return `Đã thống nhất ý chí! Đàn sói sẽ xé xác ${targetA} khi đêm đen lên đỉnh điểm.`;
    }

    if (role === 'wolfSnow') {
      return `Liên kết băng giá hoàn tất. Sinh mệnh của bạn đã được trói buộc chặt chẽ với người đồng hành ${targetA}.`;
    }

    if (role === 'wolfMage') {
      const isSeer = targetAPlayer && (targetAPlayer.role === 'seer' || targetAPlayer.role === 'apprenticeSeer');
      return `Kết quả dò tìm Tiên Tri: Đối tượng ${targetA} [${isSeer ? 'LÀ VAI TRÒ TIÊN TRI 🔮' : 'KHÔNG PHẢI TIÊN TRI ❌'}].`;
    }

    if (role === 'phantomWolf') {
      return `Đã hoán đổi nhân dạng tâm linh thành công giữa Sói ${targetA} và Dân Làng ${targetB}. Tiên tri soi họ đêm nay sẽ nhận kết quả ngược!`;
    }

    if (role === 'silencerWolf') {
      return `Đã phong ấn giọng nói của ${targetA}. Sáng mai họ sẽ hoàn toàn câm lặng mất lượt hành động!`;
    }

    if (role === 'solitaireWolf') {
      return `Đã đặt lời nguyền lá bài số phận lên ${targetA}. Khi đến lượt của họ, hệ thống sẽ ép họ rút bài sinh tử.`;
    }

    if (role === 'chaosWolf') {
      const ruleStr = modifier === 'chaos_seer' ? 'Đảo ngược Tiên Tri' : modifier === 'chaos_guard' ? 'Đảo ngược Bảo Vệ' : 'Đảo ngược Thợ Săn';
      return `Hỗn mang bộc phát! Lời nguyền Quỷ Ngữ đã bẻ cong quy tắc: [${ruleStr}] thành công đêm nay!`;
    }

    if (role === 'demonDetective') {
      const isSame = targetAPlayer?.realFaction === targetBPlayer?.realFaction;
      if (isSame) return `Kết quả đối chiếu tâm linh: ${targetA} và ${targetB} CÙNG PHE cánh! Thần lực ác ma không thể can thiệp sát hại.`;
      return `Phát hiện dị giáo! ${targetA} và ${targetB} KHÁC PHE cánh! Lưỡi hái ác ma sẽ ngẫu nhiên lấy mạng 1 trong 2 kẻ này đêm nay.`;
    }

    if (role === 'missionary') {
      return `Thu phục thành công! Linh hồn của ${targetA} đã chính thức thuộc về giáo hội của bạn.`;
    }

    if (role === 'vampire') {
      return `Nụ hôn bóng đêm hoàn tất! Bạn đã ghim nanh vuốt hút máu ${targetA} thành công.`;
    }

    if (role === 'arsonist') {
      if (modifier === 'ignite') return `BÙM! Ngọn lửa cuồng nộ đã thiêu rụi toàn bộ các mục tiêu dính xăng đêm nay!`;
      return `Đã tưới xăng âm thầm lên nhà của ${targetA}${targetB ? ' & ' + targetB : ''}. Chúng đã sẵn sàng để bốc cháy!`;
    }

    if (role === 'eradicator') {
      return `Đã kích hoạt bẫy kẹp sắt quanh ${targetA} và ${targetB}. Nếu chúng dám dùng kỹ năng lên bạn đêm nay, bẫy sắt sẽ kẹp nát đầu chúng!`;
    }

    if (role === 'manipulator') {
      return `Thôi miên thành công! Kỹ năng kích hoạt đêm nay của ${targetA} đã bị bẻ hướng dội thẳng vào người ${targetB}!`;
    }

    if (role === 'impostor') {
      return `Lưỡi dao ám sát đã cắm sâu vào cổ họng ${targetA}. Đồng thời kỹ năng mạo danh đã được gửi đi thành công!`;
    }

    if (role === 'apprenticeReaper') {
      return `Lời nguyền dự đoán đã được đặt lên linh hồn của ${targetA}. Hãy chờ xem họ có gục ngã đêm nay.`;
    }

    if (role === 'serialKiller') {
      return `Cơn cuồng sát hoàn tất! Bạn đã ra tay tàn sát dã man hạ sát mục tiêu ${targetA} thành công.`;
    }

    if (role === 'prime') {
      return `Khế ước linh hồn hoàn tất! ${targetA} và ${targetB} đã chính thức trở thành Thân Cận chịu sự chi phối của ngài.`;
    }

    if (role === 'cat') {
      if (modifier === 'cat_seal') return `Đã niêm phong hoàn toàn năng lực phép thuật của ${targetA} đêm nay.`;
      return `Móng vuốt dã thú đã cào nát lồng ngực của ${targetA} thành công!`;
    }

    if (role === 'reaper') {
      if (modifier === 'reaper_vote') return `Lệnh bài đã đóng! Toàn bộ đạo quân Xác Không Hồn sẽ đồng loạt vote treo cổ ${targetA} vào sáng mai!`;
      return `Gặt xác thành công! Linh hồn ${targetA} đã chính thức thuộc quyền điều khiển của lưỡi hái địa ngục.`;
    }

    return `Đã ghi nhận mục tiêu hành động & hoàn thành lượt đêm!`;
  };

  // Handle Night Skill Confirmation
  const handleTargetConfirm = async (
    targetId: string | null,
    secondaryId?: string | null,
    modifier?: string | null,
    phrase?: string
  ) => {
    if (!roomId || !playerId || !myPlayer) return;

    if (myPlayer.role === 'wolf' || myPlayer.realFaction === 'wolf') {
      await set(ref(db, `rooms/${roomId}/wolf_votes/${playerId}`), targetId);
    }

    const updates: Record<string, any> = {
      [`rooms/${roomId}/players/${playerId}/targetSelection`]: {
        actionType: modifier || (myPlayer.role + "_action"),
        targetId: targetId,
        secondaryId: secondaryId || null,
        phrase: phrase || "",
        timestamp: getSynchronizedTimestamp()
      },
      [`rooms/${roomId}/players/${playerId}/turnEnded`]: true
    };

    await update(ref(db), updates);

    const targetAPlayer = players.find(p => p.id === targetId);
    const targetBPlayer = players.find(p => p.id === secondaryId);
    const targetA = targetAPlayer?.name || "Mục tiêu";
    const targetB = targetBPlayer?.name || "Mục tiêu 2";

    const popupMsg = getRoleInstantPopup(
      myPlayer.role,
      modifier,
      targetA,
      targetB,
      phrase,
      targetAPlayer,
      targetBPlayer
    );

    showToast(popupMsg, "success");
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-3 right-3 z-50 animate-in slide-in-from-top duration-300">
          <div className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-xl border ${
            toastMessage.type === 'danger'
              ? "bg-rose-950/90 border-rose-600 text-rose-200"
              : toastMessage.type === 'success'
              ? "bg-emerald-950/90 border-emerald-600 text-emerald-200"
              : toastMessage.type === 'warning'
              ? "bg-amber-950/90 border-amber-600 text-amber-200"
              : "bg-slate-900/90 border-slate-700 text-slate-100"
          }`}>
            {toastMessage.msg}
          </div>
        </div>
      )}

      {/* Main View Flow */}
      {!roomId ? (
        <Lobby
          playerName={playerName}
          setPlayerName={setPlayerName}
          roomId={roomId}
          playerId={playerId}
          isHost={isHost}
          players={players}
          roomMeta={roomMeta}
          onEnterGame={(rId, pId, host) => {
            setRoomId(rId);
            setPlayerId(pId);
            setIsHost(host);
          }}
          showToast={showToast}
        />
      ) : (
        <div className="flex flex-col h-screen overflow-hidden">
          {/* Top Status Header */}
          <HeaderBar
            roomMeta={roomMeta}
            players={players}
            onOpenLeftDrawer={() => setMobileTab(4)}
            onOpenRightDrawer={() => setMobileTab(5)}
            onLeaveToLobby={() => {
              setRoomId(null);
              setPlayerId(null);
              localStorage.removeItem("reconnect_room_id");
              localStorage.removeItem("reconnect_player_id");
            }}
          />

          {/* Main Viewport Body */}
          <div className="flex-1 flex relative overflow-hidden">
            
            {/* Left Drawer / Panel: Mailbox & GM Timeline (Desktop Always / Mobile Tab 4) */}
            <aside className={`border-r border-white/5 bg-white/[0.02] flex-col z-20 transition-all duration-300 ${
              mobileTab === 4 
                ? "flex absolute inset-0 z-30 bg-[#08080c] p-3 pb-20 md:p-3.5 md:static md:flex md:w-80" 
                : "hidden md:flex md:w-80 md:p-3.5"
            }`}>
              {isHost ? (
                <div className="flex flex-col h-full space-y-2.5">
                  <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest text-left">
                    📋 SYSTEM LOGS & GM TIMELINE
                  </h3>
                  <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-3 overflow-y-auto font-mono text-[11px] text-left space-y-1.5 text-slate-300">
                    {logs.map((l, i) => (
                      <div key={i} className="leading-tight">
                        <span className="text-red-400 font-bold">[N{l.day}-{l.phase.toUpperCase()}] </span>
                        <span>{l.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Mailbox
                  mailbox={mailbox}
                  playerId={playerId}
                  roomId={roomId}
                  showToast={showToast}
                />
              )}
            </aside>

            {/* Main Center Board Arena (Desktop Always / Mobile Tabs 1, 2, 3) */}
            <main className={`flex-1 bg-[#050508] p-3 sm:p-5 overflow-y-auto pb-20 md:pb-4 flex-col space-y-3.5 ${
              mobileTab === 4 || mobileTab === 5 ? "hidden md:flex" : "flex"
            }`}>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mobileTab}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3.5 w-full"
                >
                  {/* Identity Secret Card */}
                  {(mobileTab === 1 || window.innerWidth >= 768) && (
                    <IdentityCard
                      myPlayer={myPlayer}
                      isGM={isHost}
                      showToast={showToast}
                    />
                  )}

                  {/* GM God-mode Console */}
                  {(mobileTab === 1 || window.innerWidth >= 768) && (
                    <GMConsole
                      roomId={roomId}
                      roomMeta={roomMeta}
                      isHost={isHost}
                      logs={logs}
                      showToast={showToast}
                      onForceDay={handleTransitionToDay}
                      onForceNight={handleTransitionToNight}
                      onTriggerMayor={() => setIsMayorModalOpen(true)}
                      onResolveVote={resolveVotingOutcome}
                      onExportLogs={() => {
                        const text = logs.map(l => `[Day ${l.day}-${l.phase}] ${l.msg}`).join('\n');
                        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Wolfpack_Match_${roomId}_Logs.txt`;
                        a.click();
                      }}
                    />
                  )}

                  {/* Spectator Prediction Poll */}
                  {(mobileTab === 1 || window.innerWidth >= 768) && (
                    <SpectatorWidget
                      myPlayer={myPlayer}
                      roomId={roomId}
                      showToast={showToast}
                    />
                  )}

                  {/* Trial Stage & Voting */}
                  {(mobileTab === 1 || window.innerWidth >= 768) && (
                    <TrialStage
                      trial={trial}
                      players={players}
                      myPlayerId={playerId}
                      roomMeta={roomMeta}
                      votes={votes}
                    />
                  )}

                  {/* Contextual Action Center */}
                  {(mobileTab === 1 || window.innerWidth >= 768) && (
                    <ActionCenter
                      myPlayer={myPlayer}
                      roomMeta={roomMeta}
                      onOpenTargetSelector={() => setIsTargetModalOpen(true)}
                      onOpenNominateSelector={() => setIsTargetModalOpen(true)}
                      showToast={showToast}
                    />
                  )}

                  {/* Player Grid Cards */}
                  {(mobileTab === 3 || window.innerWidth >= 768) && (
                    <PlayerGrid
                      players={players}
                      myPlayerId={playerId}
                      isGM={isHost}
                      mayorId={roomMeta?.mayorId || null}
                      wolfVotesMap={wolfVotesMap}
                      onSelectPlayer={(p) => setSelectedSheetPlayer(p)}
                    />
                  )}

                  {/* Role Setup Modal in Mobile Tab 2 */}
                  {mobileTab === 2 && isHost && (
                    <RoleSetup
                      roomId={roomId}
                      isHost={isHost}
                      players={players}
                      roleCounts={roleCounts}
                      showToast={showToast}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Right Drawer / Panel: Chat & Role Setup (Desktop Always / Mobile Tab 5) */}
            <aside className={`border-l border-white/5 bg-white/[0.02] flex-col z-20 transition-all duration-300 ${
              mobileTab === 5 
                ? "flex absolute inset-0 z-30 bg-[#08080c] p-3 pb-20 md:p-3.5 md:static md:flex md:w-80" 
                : "hidden md:flex md:w-80 md:p-3.5"
            }`}>
              {isHost && roomMeta?.phase === 'setup' && window.innerWidth >= 768 ? (
                <RoleSetup
                  roomId={roomId}
                  isHost={isHost}
                  players={players}
                  roleCounts={roleCounts}
                  showToast={showToast}
                />
              ) : (
                <ChatPanel
                  myPlayer={myPlayer}
                  roomMeta={roomMeta}
                  roomId={roomId}
                  players={players}
                  showToast={showToast}
                />
              )}
            </aside>
          </div>

          {/* Desktop Footer */}
          <footer className="hidden md:flex border-t border-white/5 bg-black/20 px-8 py-2.5 text-[10px] uppercase tracking-widest text-slate-500 justify-between items-center z-10">
            <span>WOLFPACK SOVEREIGN ENGINE • REALTIME FIREBASE v47.0</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span>SYSTEM ONLINE</span>
            </span>
          </footer>

          {/* Ultra-Modern Mobile Floating Bottom Navigation Dock */}
          <nav className="md:hidden fixed bottom-2 left-3 right-3 h-14 bg-[#0a0a0f]/95 border border-white/10 rounded-2xl flex items-center justify-around z-40 px-2 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
            <button
              type="button"
              onClick={() => setMobileTab(1)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-90 ${
                mobileTab === 1 
                  ? "text-red-400 bg-red-500/15 border border-red-500/30 font-extrabold shadow-[0_0_12px_rgba(239,68,68,0.3)]" 
                  : "text-slate-400 font-medium hover:text-slate-200"
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 tracking-tight">ARENA</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab(3)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-90 ${
                mobileTab === 3 
                  ? "text-red-400 bg-red-500/15 border border-red-500/30 font-extrabold shadow-[0_0_12px_rgba(239,68,68,0.3)]" 
                  : "text-slate-400 font-medium hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 tracking-tight">ROSTER</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab(5)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-90 ${
                mobileTab === 5 
                  ? "text-red-400 bg-red-500/15 border border-red-500/30 font-extrabold shadow-[0_0_12px_rgba(239,68,68,0.3)]" 
                  : "text-slate-400 font-medium hover:text-slate-200"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 tracking-tight">CHAT</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab(4)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-90 relative ${
                mobileTab === 4 
                  ? "text-red-400 bg-red-500/15 border border-red-500/30 font-extrabold shadow-[0_0_12px_rgba(239,68,68,0.3)]" 
                  : "text-slate-400 font-medium hover:text-slate-200"
              }`}
            >
              <ScrollText className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 tracking-tight">THƯ/LOG</span>
              {Object.values(mailbox || {}).filter((m: any) => !m.isRead).length > 0 && (
                <span className="bg-rose-500 text-white font-extrabold text-[9px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center absolute -top-1 -right-1 animate-pulse border border-rose-900 shadow">
                  {Object.values(mailbox || {}).filter((m: any) => !m.isRead).length}
                </span>
              )}
            </button>

            {isHost && (
              <button
                type="button"
                onClick={() => setMobileTab(2)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-90 ${
                  mobileTab === 2 
                    ? "text-amber-400 bg-amber-500/15 border border-amber-500/30 font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.3)]" 
                    : "text-slate-400 font-medium hover:text-slate-200"
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
                <span className="text-[9px] mt-0.5 tracking-tight">CẤU HÌNH</span>
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Modals & Overlays */}
      <NightSleepOverlay
        isVisible={roomMeta?.phase === 'night' && !!myPlayer?.alive && !!myPlayer?.turnEnded}
      />

      <TargetSelectorModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        role={myPlayer?.role || 'villager'}
        players={players}
        myPlayerId={playerId}
        hasUsedHeal={myPlayer?.hasUsedHeal}
        hasUsedPoison={myPlayer?.hasUsedPoison}
        onConfirm={handleTargetConfirm}
        showToast={showToast}
      />

      <HunterRevengeModal
        isOpen={isHunterModalOpen}
        players={players}
        onFire={async (tId) => {
          setIsHunterModalOpen(false);
          await update(ref(db, `rooms/${roomId}/players/${tId}`), { alive: false });
          showToast(`💥 Thợ săn đã nổ súng tiêu diệt ${players.find(p=>p.id===tId)?.name}!`, "danger");
        }}
        showToast={showToast}
      />

      <MayorElectionModal
        isOpen={isMayorModalOpen}
        players={players}
        onVoteMayor={async (candId) => {
          setIsMayorModalOpen(false);
          if (candId && roomId && playerId) {
            await set(ref(db, `rooms/${roomId}/mayor_votes/${playerId}`), candId);
            showToast("Đã gửi phiếu bầu Trưởng Làng!", "success");
          }
        }}
        showToast={showToast}
      />

      <GavelOverlay
        isOpen={!!gavelVerdictText}
        verdictText={gavelVerdictText || ''}
      />

      <VictoryModal
        isOpen={roomMeta?.phase === 'victory'}
        winner={roomMeta?.winner || null}
        mvpData={roomMeta?.mvp || null}
        relations={roomMeta?.relations || null}
        players={players}
        logs={logs}
        onBackToLobby={() => {
          setRoomId(null);
          setPlayerId(null);
          localStorage.removeItem("reconnect_room_id");
          localStorage.removeItem("reconnect_player_id");
        }}
      />

      <BottomSheet
        player={selectedSheetPlayer}
        isGM={isHost}
        myPlayerId={playerId}
        onClose={() => setSelectedSheetPlayer(null)}
        onKillPlayer={async (pId) => {
          if (!roomId) return;
          await update(ref(db, `rooms/${roomId}/players/${pId}`), { alive: false });
          showToast("Đã xử tử thần dân!", "danger");
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        showToast={showToast}
      />
    </div>
  );
}
