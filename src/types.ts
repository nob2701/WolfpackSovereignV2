export type Faction = 'villager' | 'wolf' | 'third';

export interface RoleInfo {
  id: string;
  name: string;
  faction: Faction;
  powerRating: number;
  icon: string;
  desc: string;
  passive?: boolean;
  soloWin?: boolean;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  alive: boolean;
  role: string;
  realFaction: Faction;
  turnEnded: boolean;
  hasSeenRole: boolean;
  joinedTime: number;
  
  // Buffs & Statuses
  isSeerScanned?: boolean;
  isProtected?: boolean;
  isGuardBlocked?: boolean;
  isWitchHealed?: boolean;
  isWitchPoisoned?: boolean;
  hasUsedHeal?: boolean;
  hasUsedPoison?: boolean;
  isHunterMarked?: boolean;
  inCouple?: boolean;
  coupleId?: string;
  isCupidLinked?: boolean;
  isAngelPurified?: boolean;
  isCarverBlacklisted?: boolean;
  isGuarantorSealed?: boolean;
  isReflectorMirrored?: boolean;
  isAvengerAsleep?: boolean;
  isAvengerExecuted?: boolean;
  isWolfTargeted?: boolean;
  isSnowWolfFrozen?: boolean;
  isWolfMageScanned?: boolean;
  isPhantomSwapped?: boolean;
  isSilencerMuted?: boolean;
  isSolitaireCursed?: boolean;
  isDemonHellfire?: boolean;
  isMissionaryConverted?: boolean;
  isVampireBitten?: boolean;
  vampireFactionId?: string;
  primeCovenantId?: string;
  reaperFactionId?: string;
  isPetroled?: boolean;
  isArsonistPetroled?: boolean;
  isArsonistIgnited?: boolean;
  isEradicatorTrapped?: boolean;
  isManipulatorManipulated?: boolean;
  isLethalSlashed?: boolean;
  isReaperPredicted?: boolean;
  isPrimeFollower?: boolean;
  isCatClawed?: boolean;
  isCatSealed?: boolean;
  isIdiotRevealed?: boolean;

  targetSelection?: {
    actionType: string;
    targetId: string | null;
    secondaryId?: string | null;
    phrase?: string;
    timestamp: number;
  } | null;
}

export type Phase = 'setup' | 'night' | 'day' | 'victory';

export interface RoomMeta {
  hostId: string;
  roomId: string;
  password?: string;
  phase: Phase;
  day: number;
  started: boolean;
  createdTime: number;
  mayorId?: string | null;
  timerEndTime?: number;
  timerDuration?: number;
  winner?: string;
  mvp?: MVPData;
  relations?: RelationLog[];
}

export interface MVPStat {
  label: string;
  value: string;
}

export interface MVPData {
  name: string;
  badge: string;
  stats: MVPStat[];
}

export interface RelationLog {
  fromId: string;
  toId: string;
  type: 'couple' | 'wolf_bite' | 'guard_protect' | 'other';
}

export interface TrialState {
  stage: 'none' | 'mayor_election' | 'nomination' | 'defense' | 'vote' | 'verdict';
  accusedId: string | null;
  accusedText?: string;
  decisionText?: string;
}

export interface MailItem {
  id: string;
  title: string;
  content: string;
  category?: 'all' | 'system' | 'role';
  isRead: boolean;
  timestamp: number;
}

export interface LogItem {
  id?: string;
  day: number;
  phase: string;
  msg: string;
  type: 'sys' | 'info' | 'kill' | 'whisper';
  timestamp: number;
}

export interface ChatMessage {
  id?: string;
  senderName: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export type ChatChannel = 'public' | 'wolf' | 'couple' | 'prime' | 'vampire' | 'reaper' | 'graveyard';
