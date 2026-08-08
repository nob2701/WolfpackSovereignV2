import React from 'react';
import { Player } from '../types';
import { getRoleName } from '../data/roles';
import { Crown, Skull, Eye, Shield, Flame, VolumeX, Moon, Heart, Sparkles, Droplet, Cross, Target, Lock, Zap, ShieldAlert } from 'lucide-react';

interface PlayerGridProps {
  players: Player[];
  myPlayerId: string | null;
  isGM: boolean;
  mayorId: string | null;
  wolfVotesMap: Record<string, number>;
  onSelectPlayer: (player: Player) => void;
}

export const PlayerGrid: React.FC<PlayerGridProps> = ({
  players,
  myPlayerId,
  isGM,
  mayorId,
  wolfVotesMap,
  onSelectPlayer
}) => {
  const aliveCount = players.filter(p => p.alive).length;
  const deadCount = players.length - aliveCount;
  const myPlayer = players.find(p => p.id === myPlayerId);
  const isWolfOrGM = isGM || (myPlayer && (myPlayer.role === 'wolf' || myPlayer.realFaction === 'wolf'));

  return (
    <div className="space-y-3 mb-4">
      {/* Grid Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
          <span>👥 PLAYER ROSTER ({players.length})</span>
        </h3>
        <div className="flex gap-2.5 text-[11px] font-bold">
          <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            Sống: {aliveCount}
          </span>
          <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
            Chết: {deadCount}
          </span>
        </div>
      </div>

      {/* Players Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {players.map((p) => {
          const isMayor = p.id === mayorId;
          const wolfVotes = wolfVotesMap[p.id] || 0;
          const showUnmaskedRole = isGM || !p.alive || p.id === myPlayerId;

          return (
            <div
              key={p.id}
              onClick={() => onSelectPlayer(p)}
              className={`relative bg-white/5 border rounded-2xl p-3.5 text-center cursor-pointer transition-all duration-200 select-none flex flex-col items-center justify-center min-h-[96px] shadow-lg hover:border-red-500 hover:bg-white/10 active:scale-95 ${
                !p.alive
                  ? "opacity-40 bg-black/40 border-white/5"
                  : p.isSeerScanned
                  ? "border-purple-500 bg-purple-500/10 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                  : p.isProtected
                  ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                  : p.inCouple
                  ? "border-pink-500 bg-pink-500/10 shadow-[0_0_12px_rgba(236,72,153,0.4)]"
                  : p.isSilencerMuted
                  ? "border-amber-500/80 bg-amber-500/10"
                  : p.isMissionaryConverted
                  ? "border-yellow-500/80 bg-yellow-500/10"
                  : p.isVampireBitten
                  ? "border-rose-600/80 bg-rose-950/20"
                  : p.isReflectorMirrored
                  ? "border-slate-300 bg-slate-400/10 shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                  : "border-white/5"
              }`}
            >
              {/* Online/Offline Status Dot */}
              <div
                className={`absolute top-2.5 left-2.5 w-2 h-2 rounded-full ${
                  p.isConnected ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-slate-600"
                }`}
              />

              {/* Mayor Crown */}
              {isMayor && (
                <div className="absolute top-2 right-2 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
                  <Crown className="w-4 h-4 fill-amber-400" />
                </div>
              )}

              {/* Dead Marker */}
              {!p.alive && (
                <div className="absolute top-2 right-2 text-red-500">
                  <Skull className="w-4 h-4" />
                </div>
              )}

              {/* Name */}
              <span className={`font-bold text-xs max-w-full truncate px-1 mt-1 ${
                !p.alive ? "line-through text-slate-500" : "text-white"
              }`}>
                {p.name}
              </span>

              {/* Unmasked Role or Hidden Badge */}
              <span className="text-[10px] text-red-400/90 font-medium mt-0.5 truncate max-w-full tracking-wide">
                {showUnmaskedRole ? `[${getRoleName(p.role)}]` : "❓"}
              </span>

              {/* Status Effect Icons */}
              <div className="flex items-center gap-1 mt-1.5 flex-wrap justify-center text-xs">
                {p.isProtected && <Shield className="w-3.5 h-3.5 text-emerald-400" />}
                {p.isSeerScanned && <Eye className="w-3.5 h-3.5 text-purple-400" />}
                {p.inCouple && <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />}
                {p.isSilencerMuted && <VolumeX className="w-3.5 h-3.5 text-amber-500" />}
                {p.isSnowWolfFrozen && <Moon className="w-3.5 h-3.5 text-sky-400" />}
                {(p.isPetroled || p.isArsonistPetroled) && <Flame className="w-3.5 h-3.5 text-orange-500" />}
                {p.isMissionaryConverted && <Cross className="w-3.5 h-3.5 text-yellow-400" />}
                {p.isVampireBitten && <Droplet className="w-3.5 h-3.5 text-red-500 fill-red-500" />}
                {p.isPrimeFollower && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                {p.isHunterMarked && <Target className="w-3.5 h-3.5 text-rose-500" />}
                {p.isCatSealed && <Lock className="w-3.5 h-3.5 text-indigo-400" />}
                {p.isEradicatorTrapped && <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />}
              </div>

              {/* Wolf Consensus Votes Badge */}
              {isWolfOrGM && wolfVotes > 0 && (
                <div className="absolute bottom-1.5 right-1.5 bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full shadow">
                  🐺 x{wolfVotes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
