import React, { useState } from 'react';
import { Player } from '../../types';
import { sound } from '../../services/audio';
import { Crown } from 'lucide-react';

interface MayorElectionModalProps {
  isOpen: boolean;
  players: Player[];
  onVoteMayor: (candidateId: string | 'skip') => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'danger' | 'warning') => void;
}

export const MayorElectionModal: React.FC<MayorElectionModalProps> = ({
  isOpen,
  players,
  onVoteMayor,
  showToast
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  if (!isOpen) return null;

  const alivePlayers = players.filter(p => p.alive);

  const handleSubmit = () => {
    sound.playSFX('click');
    if (!selectedCandidate) {
      showToast("Vui lòng chọn ứng viên Trưởng Làng!", "warning");
      return;
    }
    onVoteMayor(selectedCandidate);
  };

  const handleSkip = () => {
    sound.playSFX('click');
    onVoteMayor('skip');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121218] border border-amber-500 rounded-2xl p-5 max-w-sm w-full text-center space-y-4 shadow-2xl">
        <h3 className="text-sm font-serif font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
          <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span>BẦU CHỌN TRƯỞNG LÀNG</span>
        </h3>

        <p className="text-xs text-slate-300">
          Hãy chọn thành viên uy tín nhất để trao trọng trách lá phiếu Trưởng Làng!
        </p>

        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {alivePlayers.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedCandidate(p.id)}
              className={`p-2.5 rounded-xl border font-bold text-xs cursor-pointer transition ${
                selectedCandidate === p.id
                  ? "bg-amber-500 border-amber-400 text-slate-950"
                  : "bg-[#050507] border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              {p.name}
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSkip}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition"
          >
            Phiếu Trắng
          </button>
          <button
            onClick={handleSubmit}
            className="flex-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-950/40"
          >
            👑 BẦU TRƯỞNG LÀNG
          </button>
        </div>
      </div>
    </div>
  );
};
