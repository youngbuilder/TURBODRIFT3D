/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Play,
  Check,
  Share2,
  Sparkles,
  Flag,
  Car,
  Palette,
  Gauge,
  Zap,
  Compass,
  PlusCircle,
  RefreshCw,
  LogOut,
  Globe,
  Volume2,
  VolumeX,
  Music,
  Settings,
} from 'lucide-react';
import { CarShowroom } from './CarShowroom';
import { sound } from '../game/audio';
import { TRACK_METADATA } from '../game/tracks';
import {
  AIDifficulty,
  CarCustomization,
  CarModelType,
  GameMode,
  PlayerInfo,
  RoomState,
  RoomSummary,
  TrackId,
  VEHICLE_CONFIGS,
} from '../types/game';

interface LobbyProps {
  roomState: RoomState | null;
  currentPlayer: PlayerInfo | null;
  roomList: RoomSummary[];
  onUpdateProfile: (name: string, customization: CarCustomization, isReady: boolean, team: any) => void;
  onUpdateSettings: (trackId: TrackId, laps: number, bots: number, gameMode: GameMode, aiDifficulty: AIDifficulty) => void;
  onStartRace: () => void;
  onQuickStart: (trackId: TrackId, customization: CarCustomization, nickname: string) => void;
  onCreateRoom: (
    roomName: string,
    trackId: TrackId,
    gameMode: GameMode,
    aiDifficulty: AIDifficulty,
    botsCount: number,
    nickname: string,
    customization: CarCustomization
  ) => void;
  onJoinRoom: (roomId: string, name: string, customization: CarCustomization) => void;
  onLeaveRoom: () => void;
  onRefreshRoomList: () => void;
  onSendChat: (emoji: string, text: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  graphicQuality: number;
  setGraphicQuality: (quality: number) => void;
}

const PRESET_COLORS = ['#ef4444', '#06b6d4', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#0f172a', '#f8fafc'];

export const Lobby: React.FC<LobbyProps> = ({
  roomState,
  currentPlayer,
  roomList,
  onUpdateProfile,
  onUpdateSettings,
  onStartRace,
  onQuickStart,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onRefreshRoomList,
  isDarkMode,
  onToggleDarkMode,
  graphicQuality,
  setGraphicQuality,
}) => {
  const [nickname, setNickname] = useState(() => '레이서_' + Math.floor(100 + Math.random() * 900));
  const [selectedTrack, setSelectedTrack] = useState<TrackId>('city-downtown');
  const [gameMode, setGameMode] = useState<GameMode>('solo');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [aiBotsCount, setAiBotsCount] = useState<number>(4);
  const [newRoomName, setNewRoomName] = useState<string>('스피드 레이싱 방');
  const [customization, setCustomization] = useState<CarCustomization>({
    model: 'sport',
    color: '#ef4444',
    accentColor: '#06b6d4',
    neonColor: '#06b6d4',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [isMuted, setIsMuted] = useState(sound.isSoundMuted());
  const [isMusicMuted, setIsMusicMuted] = useState(sound.isMusicDisabled());

  const isHost = currentPlayer?.isHost ?? false;
  const currentVehicleStats = VEHICLE_CONFIGS[customization.model] || VEHICLE_CONFIGS.sport;

  const handleModelChange = (model: CarModelType) => {
    const updated = { ...customization, model };
    setCustomization(updated);
    if (currentPlayer) {
      onUpdateProfile(nickname, updated, currentPlayer.isReady, currentPlayer.team);
    }
  };

  const handleColorChange = (key: keyof CarCustomization, color: string) => {
    const updated = { ...customization, [key]: color };
    setCustomization(updated);
    if (currentPlayer) {
      onUpdateProfile(nickname, updated, currentPlayer.isReady, currentPlayer.team);
    }
  };

  const handleReadyToggle = () => {
    if (currentPlayer) {
      onUpdateProfile(nickname, customization, !currentPlayer.isReady, currentPlayer.team);
    }
  };

  const handleCopyLink = () => {
    if (!roomState) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${roomState.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const allPlayersReady = roomState ? roomState.players.every((p) => p.isReady || p.isHost) : false;

  return (
    <div className={`relative min-h-screen w-full flex flex-col justify-between p-3 md:p-6 select-none overflow-x-hidden ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto w-full pt-2">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
          <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
            TURBO DRIFT 3D
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 rounded-2xl px-3 py-2 backdrop-blur-md">
            <button type="button" onClick={() => { const muted = sound.toggleMute(); setIsMuted(muted); }} className={`p-1.5 rounded-xl border transition-colors ${isMuted ? 'bg-rose-950/40 border-rose-800 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-200'}`}>
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <button type="button" onClick={() => { const m = sound.toggleMusic(); setIsMusicMuted(m); }} className={`p-1.5 rounded-xl border transition-colors ${isMusicMuted ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-cyan-950/40 border-cyan-800 text-cyan-300'}`}>
              <Music size={15} />
            </button>
          </div>
          
          <div className={`flex items-center gap-2 ${isDarkMode ? 'bg-slate-900/95 border-slate-700/60' : 'bg-white border-slate-300 shadow-md'} border rounded-2xl px-4 py-2 backdrop-blur-md`}>
                <Settings size={15} className="text-slate-400"/>
                <input
                    type="range"
                    min="40"
                    max="100"
                    value={graphicQuality}
                    onChange={(e) => setGraphicQuality(Number(e.target.value))}
                    className="accent-cyan-400 cursor-pointer w-24"
                />
                <span className="text-xs font-bold text-cyan-300">{graphicQuality}%</span>
          </div>

          <button
            type="button"
            onClick={onToggleDarkMode}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl ${isDarkMode ? 'bg-slate-900/95 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-800 shadow-md'} border text-xs font-bold transition-all`}
          >
            <span>{isDarkMode ? '🌞 라이트모드' : '🌙 다크모드'}</span>
          </button>
          <div className={`flex items-center gap-2 ${isDarkMode ? 'bg-slate-900/95 border-slate-700/60' : 'bg-white border-slate-300 shadow-md'} border rounded-2xl px-4 py-2 backdrop-blur-md`}>
            <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} font-semibold`}>닉네임:</span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={12}
              className={`${isDarkMode ? 'bg-slate-950 border-slate-700 text-cyan-300' : 'bg-slate-100 border-slate-300 text-slate-900'} border rounded-lg px-2.5 py-1 text-xs font-bold outline-none w-28 text-center focus:border-cyan-400`}
            />
          </div>
        </div>
      </div>
      {/* Lobby content remains same */}
    </div>
  );
};
