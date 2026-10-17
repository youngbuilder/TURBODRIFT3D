/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, ArrowRight, Flag, Clock, Award, Star } from 'lucide-react';
import { PlayerInfo } from '../types/game';

interface PodiumProps {
  results: PlayerInfo[];
  currentPlayerId: string;
  isHost: boolean;
  onReturnToLobby: () => void;
  onRematch: () => void;
  isDarkMode: boolean;
}

export const Podium: React.FC<PodiumProps> = ({
  results,
  currentPlayerId,
  isHost,
  onReturnToLobby,
  onRematch,
  isDarkMode,
}) => {
  useEffect(() => {
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ['#facc15', '#38bdf8', '#ec4899', '#22c55e'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ['#facc15', '#38bdf8', '#ec4899', '#22c55e'],
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const formatTime = (ms: number) => {
    if (!ms) return '--:--';
    const totalSec = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    const millis = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
  };

  const sortedResults = [...results].sort((a, b) => {
    if (a.place && b.place) return a.place - b.place;
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;
    return b.progress - a.progress;
  });

  const winner = sortedResults[0];
  const second = sortedResults[1];
  const third = sortedResults[2];

  return (
    <div className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-slate-950/95' : 'bg-slate-50/95'} backdrop-blur-md flex flex-col items-center justify-between p-4 md:p-6 overflow-y-auto select-none`}>
      <div className="text-center mt-2">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${isDarkMode ? 'bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border-amber-400/50 text-amber-300' : 'bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 border-amber-300 text-amber-800'} border font-black text-xs md:text-sm tracking-widest uppercase mb-1.5 shadow-lg`}>
          <Award size={16} className={isDarkMode ? 'text-amber-400' : 'text-amber-600'} />
          VICTORY CEREMONY
        </div>
        <h1 className={`text-3xl md:text-5xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} italic tracking-tight`}>
          CHAMPIONS PODIUM
        </h1>
      </div>

      <div className="flex items-end justify-center gap-2 md:gap-6 my-6 w-full max-w-2xl px-2">
        {second ? (
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-2 text-center">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-300 text-slate-900 font-black flex items-center justify-center text-xl shadow-xl border-4 border-slate-400 mx-auto">
                2
              </div>
              <div className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} text-xs md:text-sm mt-1.5 truncate max-w-[100px] md:max-w-[140px]`}>
                {second.name}
              </div>
              <div className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} font-mono`}>{formatTime(second.finishTime)}</div>
            </div>
            <div className="w-full h-28 md:h-36 bg-gradient-to-t from-slate-600 to-slate-400 border-t-4 border-slate-200 rounded-t-2xl shadow-xl flex flex-col items-center justify-center">
              <span className="text-2xl md:text-3xl font-black text-white">2ND</span>
              <span className="text-[10px] text-slate-100 font-bold uppercase tracking-widest">SILVER</span>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {winner ? (
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-2 text-center">
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-4xl md:text-5xl shadow-2xl border-4 border-yellow-200 mx-auto animate-bounce">
                1
              </div>
              <div className={`font-black ${isDarkMode ? 'text-amber-300' : 'text-amber-700'} text-base md:text-2xl mt-1.5 truncate max-w-[120px] md:max-w-[200px]`}>
                {winner.name}
              </div>
              <div className={`text-sm md:text-base ${isDarkMode ? 'text-amber-200' : 'text-amber-800'} font-mono font-bold`}>{formatTime(winner.finishTime)}</div>
            </div>
            <div className="w-full h-44 md:h-64 bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 border-t-4 border-yellow-100 rounded-t-2xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
              <Star className="text-yellow-100 mb-1" size={48} />
              <span className="text-4xl md:text-6xl font-black text-white leading-none">1ST</span>
              <span className="text-sm md:text-base text-amber-50 font-black uppercase tracking-widest mt-1">GOLD</span>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {third ? (
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-2 text-center">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-amber-700 text-amber-100 font-black flex items-center justify-center text-xl shadow-xl border-4 border-amber-600 mx-auto">
                3
              </div>
              <div className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} text-xs md:text-sm mt-1.5 truncate max-w-[100px] md:max-w-[140px]`}>
                {third.name}
              </div>
              <div className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} font-mono`}>{formatTime(third.finishTime)}</div>
            </div>
            <div className="w-full h-20 md:h-28 bg-gradient-to-t from-amber-900 to-amber-700 border-t-4 border-amber-600 rounded-t-2xl shadow-xl flex flex-col items-center justify-center">
              <span className="text-xl md:text-2xl font-black text-white">3RD</span>
              <span className="text-[10px] text-amber-100 font-bold uppercase tracking-widest">BRONZE</span>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      <div className={`w-full max-w-xl ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xl'} border rounded-2xl p-4 shadow-xl mb-4 max-h-48 overflow-y-auto`}>
        <h4 className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider mb-2.5 flex items-center justify-between`}>
          <span className="flex items-center gap-1.5">
            <Flag size={13} className="text-cyan-500" />
            전체 순위 리스트
          </span>
          <span className="text-[10px] text-slate-500">총 {sortedResults.length}명 완주</span>
        </h4>
        <div className="space-y-1.5">
          {sortedResults.map((player, idx) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                player.id === currentPlayerId
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-800 font-bold'
                  : isDarkMode ? 'bg-slate-800/40 border-slate-700/40 text-slate-300' : 'bg-slate-100/80 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-5 text-center font-mono font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {idx + 1}
                </span>
                <span
                  className="w-3 h-3 rounded-full border border-black/10"
                  style={{ backgroundColor: player.carColor }}
                />
                <span className="truncate max-w-[120px] md:max-w-[200px]">{player.name}</span>
                {player.id === currentPlayerId && (
                  <span className="text-[9px] px-1.5 rounded bg-cyan-500/20 text-cyan-700">YOU</span>
                )}
              </div>
              <div className={`flex items-center gap-1 font-mono text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <Clock size={11} />
                <span>{player.finished ? formatTime(player.finishTime) : '미완주'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 w-full max-w-md justify-center pb-2">
        <button
          onClick={onReturnToLobby}
          className={`flex-1 py-3.5 rounded-2xl ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900'} border font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg`}
        >
          <ArrowRight size={16} />
          로비로 이동
        </button>
        {isHost && (
          <button
            onClick={onRematch}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-cyan-500/30"
          >
            <RotateCcw size={16} />
            다시 레이스
          </button>
        )}
      </div>
    </div>
  );
};
