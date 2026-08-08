import React, { useState, useEffect } from 'react';
import { TrialState, Player, RoomMeta } from '../types';
import { db, ref, update, set } from '../services/firebase';
import { sound } from '../services/audio';
import { Scale, CheckCircle2, XCircle, Crown } from 'lucide-react';

interface TrialStageProps {
  trial: TrialState | null;
  players: Player[];
  myPlayerId: string | null;
  roomMeta: RoomMeta | null;
  votes: Record<string, string> | null;
}

export const TrialStage: React.FC<TrialStageProps> = ({
  trial,
  players,
  myPlayerId,
  roomMeta,
  votes
}) => {
  const [defenseText, setDefenseText] = useState('');

  if (!trial || trial.stage === 'none') return null;

  const accused = players.find(p => p.id === trial.accusedId);
  const isAccused = myPlayerId === trial.accusedId;
  const myPlayer = players.find(p => p.id === myPlayerId);
  const mayorId = roomMeta?.mayorId;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDefenseText(e.target.value);
    if (roomMeta?.roomId) {
      update(ref(db, `rooms/${roomMeta.roomId}/trial`), {
        accusedText: e.target.value
      });
    }
  };

  const handleFinishDefense = async () => {
    if (!roomMeta?.roomId) return;
    sound.playSFX('click');
    await update(ref(db, `rooms/${roomMeta.roomId}/trial`), {
      stage: 'vote'
    });
  };

  const handleVote = async (choice: 'ACQUIT' | 'EXECUTE') => {
    if (!roomMeta?.roomId || !myPlayerId || !myPlayer?.alive || myPlayer.isIdiotRevealed) return;
    sound.playSFX('click');
    await set(ref(db, `rooms/${roomMeta.roomId}/votes/${myPlayerId}`), choice);
  };

  // Vote counts calculation
  const currentVotes = votes || {};
  let countAcquit = 0;
  let countExecute = 0;
  const acquitVoters: { name: string; isMayor: boolean }[] = [];
  const executeVoters: { name: string; isMayor: boolean }[] = [];

  Object.entries(currentVotes).forEach(([voterId, val]) => {
    const voter = players.find(p => p.id === voterId);
    if (voter && voter.alive && !voter.isIdiotRevealed) {
      const isMayor = voterId === mayorId;
      const weight = isMayor ? 2 : 1;
      const info = { name: voter.name, isMayor };

      if (val === 'ACQUIT') {
        countAcquit += weight;
        acquitVoters.push(info);
      } else if (val === 'EXECUTE') {
        countExecute += weight;
        executeVoters.push(info);
      }
    }
  });

  return (
    <div className="bg-[#121218]/90 border border-slate-800 rounded-2xl p-4 mb-4 shadow-2xl backdrop-blur-md">
      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-1 text-[11px] font-bold text-center mb-3">
        <div className={`p-2 rounded-lg border ${
          trial.stage === 'nomination'
            ? "bg-amber-500/10 border-amber-500 text-amber-400"
            : "bg-[#050507] border-slate-800 text-slate-500"
        }`}>
          1. Đề cử
        </div>

        <div className={`p-2 rounded-lg border ${
          trial.stage === 'defense'
            ? "bg-amber-500/10 border-amber-500 text-amber-400"
            : "bg-[#050507] border-slate-800 text-slate-500"
        }`}>
          2. Biện hộ
        </div>

        <div className={`p-2 rounded-lg border ${
          trial.stage === 'vote'
            ? "bg-amber-500/10 border-amber-500 text-amber-400"
            : "bg-[#050507] border-slate-800 text-slate-500"
        }`}>
          3. Phán quyết
        </div>

        <div className={`p-2 rounded-lg border ${
          trial.stage === 'verdict'
            ? "bg-amber-500/10 border-amber-500 text-amber-400"
            : "bg-[#050507] border-slate-800 text-slate-500"
        }`}>
          4. Di ngôn
        </div>
      </div>

      {/* Defense Stage Input / Display */}
      {trial.stage === 'defense' && (
        <div className="mt-3">
          {isAccused ? (
            <div className="bg-[#050507] p-3 rounded-xl border-2 border-amber-500 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                LỜI BÀO CHỮA CỦA BỊ CÁO:
              </span>
              <textarea
                value={defenseText}
                onChange={handleTextChange}
                placeholder="Soạn thảo lời bào chữa cứu rỗi bản thân..."
                className="w-full h-24 bg-[#121218] border border-slate-700 text-slate-100 rounded-lg p-2.5 text-xs outline-none focus:border-amber-400 transition"
              />
              <button
                onClick={handleFinishDefense}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs transition"
              >
                Gửi Lời Biện Hộ
              </button>
            </div>
          ) : (
            <div className="bg-[#050507] p-3 rounded-xl border-l-4 border-amber-500 text-left min-h-[70px]">
              <p className="text-xs italic text-amber-300">
                Bị cáo [{accused?.name}] đang soạn thảo lời bào chữa...
              </p>
              <p className="text-xs text-slate-200 mt-1 font-medium">
                "{trial.accusedText || "..."}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Voting Stage Modal / Split Screen */}
      {trial.stage === 'vote' && (
        <div className="mt-3 space-y-3">
          <div className="text-center">
            <h4 className="font-serif font-bold text-sm text-amber-400 uppercase">
              BIỂU QUYẾT SỐ PHẬN: {accused?.name?.toUpperCase()}
            </h4>
            <p className="text-[10px] text-slate-400">
              Lá phiếu của Trưởng Làng 👑 có trọng số nhân đôi (2đ)!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-h-[120px]">
            {/* Acquit Column */}
            <div className="bg-[#050507] border border-emerald-500/30 rounded-xl p-2.5">
              <div className="text-xs font-bold text-emerald-400 text-center pb-1.5 border-b border-slate-800 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>THA BỔNG ({countAcquit}đ)</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {acquitVoters.map((v, i) => (
                  <span
                    key={i}
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      v.isMayor
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                        : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                  >
                    {v.name} {v.isMayor && "👑 (2đ)"}
                  </span>
                ))}
              </div>
            </div>

            {/* Execute Column */}
            <div className="bg-[#050507] border border-rose-500/30 rounded-xl p-2.5">
              <div className="text-xs font-bold text-rose-400 text-center pb-1.5 border-b border-slate-800 flex items-center justify-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>XỬ TỬ ({countExecute}đ)</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {executeVoters.map((v, i) => (
                  <span
                    key={i}
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      v.isMayor
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                        : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                  >
                    {v.name} {v.isMayor && "👑 (2đ)"}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Vote Buttons */}
          {myPlayer?.alive && !myPlayer?.isIdiotRevealed && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleVote('ACQUIT')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md shadow-emerald-950/40"
              >
                🟢 THA BỔNG
              </button>
              <button
                onClick={() => handleVote('EXECUTE')}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md shadow-rose-950/40"
              >
                🔴 XỬ TỬ
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
