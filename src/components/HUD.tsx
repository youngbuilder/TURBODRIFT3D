/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  Camera,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Flag,
  Share2,
  Check,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { sound } from '../game/audio';
import { VehicleState } from '../game/physics';
import { ItemType, TeamId } from '../types/game';

interface HUDProps {
  vehicleState: VehicleState | null;
  totalLaps: number;
  totalRacers: number;
  roomId: string;
  cameraMode: number;
  playerTeam?: TeamId;
  onCycleCamera: () => void;
  onResetCar: () => void;
  onUseItem: () => void;
  onForfeit: () => void;
  onSendQuickChat: (emoji: string, text: string) => void;
  onTouchInput?: (input: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    drift: boolean;
    item: boolean;
  }) => void;
}

export const HUD: React.FC<HUDProps> = ({
  vehicleState,
  totalLaps,
  totalRacers,
  roomId,
  cameraMode,
  playerTeam = 'none',
  onCycleCamera,
  onResetCar,
  onUseItem,
  onForfeit,
  onSendQuickChat,
  onTouchInput,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.isSoundMuted());
  const [isMusicMuted, setIsMusicMuted] = useState(sound.isMusicDisabled());
  const [showForfeitModal, setShowForfeitModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [touchState, setTouchState] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    drift: false,
    item: false,
  });

  const updateTouch = (key: keyof typeof touchState, value: boolean) => {
    const next = { ...touchState, [key]: value };
    setTouchState(next);
    if (onTouchInput) onTouchInput(next);
  };

  const speed = vehicleState ? Math.max(0, Math.round(vehicleState.speedKmh)) : 0;
  const rank = vehicleState?.rank || 1;
  const currentLap = vehicleState?.currentLap || 1;
  const currentItem = vehicleState?.currentItem;
  const driftLevel = vehicleState?.driftBoostLevel || 0;
  const isDrifting = vehicleState?.isDrifting || false;
  const isBoosting = vehicleState?.isBoosting || false;
  const isFinished = vehicleState?.isFinished || false;

  const gear = speed === 0 ? 'N' : speed < 45 ? '1' : speed < 90 ? '2' : speed < 140 ? '3' : speed < 190 ? '4' : '5';
  const cameraNames = ['3인칭', '후방', '1인칭', '탑뷰', '결승선 관전'];

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getItemLabel = (item: ItemType) => {
    switch (item) {
      case 'nitro':
        return { name: '니트로 부스트', icon: '🚀' };
      case 'shield':
        return { name: '에너지 쉴드', icon: '🛡️' };
      case 'trap':
        return { name: 'EMP 지뢰', icon: '⚠️' };
      case 'rocket':
        return { name: '호밍 미사일', icon: '🎯' };
      default:
        return { name: '아이템', icon: '📦' };
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex flex-col justify-between p-3 md:p-6">
      <div className="flex items-start justify-between w-full pointer-events-auto gap-2">
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl px-3 py-1.5 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="font-black italic text-cyan-400 tracking-wider text-xs md:text-sm">
                TURBO DRIFT
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-slate-400">방 코드:</span>
              <span className="font-mono font-bold text-amber-300 text-xs tracking-wider">{roomId}</span>
              <button
                onClick={handleCopyLink}
                className="text-slate-400 hover:text-cyan-300 transition-colors p-0.5"
                title="링크 복사"
              >
                {copiedLink ? <Check size={12} className="text-green-400" /> : <Share2 size={12} />}
              </button>
            </div>
          </div>

          {playerTeam !== 'none' && (
            <div
              className={`px-3 py-1.5 rounded-xl border font-bold text-xs shadow-md backdrop-blur-md flex items-center gap-1.5 ${
                playerTeam === 'red'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                  : 'bg-blue-950/80 border-blue-500 text-blue-300'
              }`}
            >
              <span>팀: {playerTeam === 'red' ? '레드팀' : '블루팀'}</span>
            </div>
          )}

          <button
            onClick={() => setShowForfeitModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-600 text-slate-300 hover:text-rose-200 text-xs font-bold shadow-lg transition-all active:scale-95"
            title="포기하기"
          >
            <LogOut size={13} className="text-rose-400" />
            <span>포기</span>
          </button>

          {isFinished && (
            <div className="px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-200 font-black text-xs backdrop-blur-md animate-pulse">
              🏁 완주 완료! 결승선 관전 모드 [C키로 시점 전환]
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 border border-slate-700/60 rounded-xl p-1 backdrop-blur-md">
            {['🔥', '👍', '😎', '👋', 'GG'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => onSendQuickChat(emoji, emoji === 'GG' ? 'Good Game!' : emoji)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-cyan-500/30 text-xs font-bold flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl px-3 py-1.5 shadow-lg backdrop-blur-md text-right">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-end gap-1">
              <Flag size={11} className="text-amber-400" />
              LAP
            </div>
            <div className="font-black text-white text-base md:text-lg tracking-wider">
              {Math.min(currentLap, totalLaps)} <span className="text-slate-500 text-xs">/ {totalLaps}</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-300/40 rounded-xl px-3.5 py-1.5 shadow-xl backdrop-blur-md text-center min-w-[70px]">
            <div className="text-[9px] font-bold text-amber-200 uppercase tracking-widest">RANK</div>
            <div className="font-black text-white text-xl md:text-2xl leading-none mt-0.5">
              {rank}
              <span className="text-[11px] text-amber-200/80 ml-0.5 font-semibold">/{totalRacers}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="self-center flex flex-col items-center pointer-events-none">
        {isDrifting && !isFinished && (
          <div className="mb-4 flex flex-col items-center animate-bounce">
            <div
              className={`px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border backdrop-blur-md shadow-lg ${
                driftLevel === 3
                  ? 'bg-purple-950/90 text-purple-300 border-purple-400 shadow-purple-500/50'
                  : driftLevel === 2
                  ? 'bg-amber-950/90 text-amber-300 border-amber-400 shadow-amber-500/50'
                  : 'bg-cyan-950/90 text-cyan-300 border-cyan-400 shadow-cyan-500/50'
              }`}
            >
              {driftLevel === 3
                ? '⚡ ULTRA TURBO READY! (3단)'
                : driftLevel === 2
                ? '🔥 SUPER TURBO CHARGING...'
                : '💨 MINI TURBO CHARGING...'}
            </div>
          </div>
        )}
      </div>

      {!isFinished && (
        <div className="md:hidden flex justify-between items-end w-full pointer-events-auto pb-16">
          <div className="flex gap-2 bg-slate-900/60 p-2 rounded-2xl backdrop-blur-sm border border-slate-700/50">
            <button
              onPointerDown={() => updateTouch('left', true)}
              onPointerUp={() => updateTouch('left', false)}
              onPointerLeave={() => updateTouch('left', false)}
              className={`w-14 h-14 rounded-xl font-black text-lg ${
                touchState.left ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-200'
              }`}
            >
              ◀
            </button>
            <button
              onPointerDown={() => updateTouch('right', true)}
              onPointerUp={() => updateTouch('right', false)}
              onPointerLeave={() => updateTouch('right', false)}
              className={`w-14 h-14 rounded-xl font-black text-lg ${
                touchState.right ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-200'
              }`}
            >
              ▶
            </button>
          </div>

          <div className="flex flex-col gap-2 items-end">
            {currentItem && (
              <button
                onClick={onUseItem}
                className="w-16 h-12 rounded-xl bg-amber-500 active:scale-95 text-white font-black text-sm flex items-center justify-center shadow-lg"
              >
                {getItemLabel(currentItem).icon} 사용
              </button>
            )}
            <div className="flex gap-2 bg-slate-900/60 p-2 rounded-2xl backdrop-blur-sm border border-slate-700/50">
              <button
                onPointerDown={() => updateTouch('drift', true)}
                onPointerUp={() => updateTouch('drift', false)}
                onPointerLeave={() => updateTouch('drift', false)}
                className={`w-14 h-14 rounded-xl font-black text-xs ${
                  touchState.drift ? 'bg-purple-500 text-white' : 'bg-slate-800 text-purple-300'
                }`}
              >
                DRIFT
              </button>
              <button
                onPointerDown={() => updateTouch('backward', true)}
                onPointerUp={() => updateTouch('backward', false)}
                onPointerLeave={() => updateTouch('backward', false)}
                className={`w-14 h-14 rounded-xl font-black text-xs ${
                  touchState.backward ? 'bg-rose-600 text-white' : 'bg-slate-800 text-rose-300'
                }`}
              >
                후진
              </button>
              <button
                onPointerDown={() => updateTouch('forward', true)}
                onPointerUp={() => updateTouch('forward', false)}
                onPointerLeave={() => updateTouch('forward', false)}
                className={`w-14 h-14 rounded-xl font-black text-sm ${
                  touchState.forward ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-cyan-300'
                }`}
              >
                전진
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="self-center pointer-events-auto flex flex-col items-center max-w-[940px] w-full">
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="mb-1 px-3 py-1 rounded-full bg-slate-900/85 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-all shadow-md"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp size={14} className="text-cyan-400" />
              <span>HUD 표시</span>
            </>
          ) : (
            <>
              <ChevronDown size={14} className="text-cyan-400" />
              <span>HUD 숨기기</span>
            </>
          )}
        </button>

        <div
          className={`w-full bg-slate-950/85 border border-cyan-500/30 rounded-2xl p-3 md:p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
            isDockCollapsed ? 'translate-y-28 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative flex items-baseline gap-1">
                <span className="font-mono font-black text-3xl md:text-5xl text-white tracking-tighter">
                  {speed}
                </span>
                <span className="font-bold text-xs md:text-sm text-cyan-400">KM/H</span>
              </div>
              <div className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-center">
                <div className="text-[9px] font-semibold text-slate-400">GEAR</div>
                <div className="font-mono font-bold text-amber-400 text-sm md:text-base leading-none mt-0.5">
                  {gear}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentItem && !isFinished ? (
                <button
                  onClick={onUseItem}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs md:text-sm shadow-lg shadow-amber-500/30"
                >
                  <span className="text-xl">{getItemLabel(currentItem).icon}</span>
                  <span>{getItemLabel(currentItem).name}</span>
                </button>
              ) : (
                <div className="text-xs text-slate-500">
                  {isFinished ? '🏁 완주 완료 (관전 모드)' : '아이템 대기중'}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 md:gap-2">
              <button
                onClick={onCycleCamera}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
                title="시점 변경: [C]"
              >
                <Camera size={14} className="text-cyan-400" />
                <span className="hidden sm:inline">{cameraNames[cameraMode]}</span>
              </button>
              <button
                onClick={() => {
                  const muted = sound.toggleMute();
                  setIsMuted(muted);
                }}
                className={`p-2 rounded-lg border transition-colors ${
                  isMuted ? 'bg-rose-950/40 border-rose-800 text-rose-400' : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
                title="음소거"
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <button
                onClick={() => {
                  const m = sound.toggleMusic();
                  setIsMusicMuted(m);
                }}
                className={`p-2 rounded-lg border transition-colors ${
                  isMusicMuted ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-cyan-950/40 border-cyan-800 text-cyan-300'
                }`}
                title="BGM"
              >
                <Music size={14} />
              </button>
              {!isFinished && (
                <button
                  onClick={onResetCar}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                  title="초기화: [R]"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showForfeitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 pointer-events-auto backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-black text-white mb-1">정말 레이스를 포기하시겠습니까?</h3>
            <p className="text-xs text-slate-400 mb-5">대기실로 돌아갑니다.</p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowForfeitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowForfeitModal(false);
                  onForfeit();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs"
              >
                포기하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
