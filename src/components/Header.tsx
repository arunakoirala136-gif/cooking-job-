import React from 'react';
import { Volume2, VolumeX, HelpCircle, Map, RotateCcw } from 'lucide-react';
import { LevelConfig, TileType } from '../types';
import { TILE_METAS } from '../data/levels';

interface HeaderProps {
  level: LevelConfig;
  score: number;
  movesLeft: number;
  goalProgress: { [key in TileType]?: number };
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLevelSelect: () => void;
  onOpenHelp: () => void;
  onRestartLevel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  level,
  score,
  movesLeft,
  goalProgress,
  isMuted,
  onToggleMute,
  onOpenLevelSelect,
  onOpenHelp,
  onRestartLevel,
}) => {
  // Compute star ratings
  const [star1, star2, star3] = level.starScores;
  const starsEarned = score >= star3 ? 3 : score >= star2 ? 2 : score >= star1 ? 1 : 0;
  const scorePercent = Math.min(100, (score / star3) * 100);

  return (
    <header className="w-full max-w-2xl mx-auto px-3 py-2">
      {/* Top Bar: Nav controls & Level Info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <button
            id="btn-level-map"
            onClick={onOpenLevelSelect}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-sm font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer"
            title="Level Map"
          >
            <Map className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">Levels</span>
          </button>
          <button
            id="btn-restart-level"
            onClick={onRestartLevel}
            className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 shadow-xs transition-transform active:scale-95 cursor-pointer"
            title="Restart Level"
          >
            <RotateCcw className="w-4 h-4 text-amber-700" />
          </button>
        </div>

        {/* Level Title */}
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Level {level.id}
          </div>
          <h1 className="text-base sm:text-lg font-black text-rose-900 leading-tight">
            {level.name}
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="btn-toggle-sound"
            onClick={onToggleMute}
            className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 shadow-xs transition-transform active:scale-95 cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-700" />
            )}
          </button>
          <button
            id="btn-help-guide"
            onClick={onOpenHelp}
            className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 shadow-xs transition-transform active:scale-95 cursor-pointer"
            title="Recipe Guide & Help"
          >
            <HelpCircle className="w-4 h-4 text-amber-700" />
          </button>
        </div>
      </div>

      {/* Main Stats Card: Moves, Recipe Goals, Score */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-3 shadow-md border-2 border-amber-200/80 grid grid-cols-12 gap-2 items-center">
        {/* Moves Counter Badge */}
        <div className="col-span-3 sm:col-span-3 flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-700">
            Moves
          </span>
          <span
            className={`text-2xl sm:text-3xl font-black leading-none my-0.5 ${
              movesLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-rose-900'
            }`}
          >
            {movesLeft}
          </span>
        </div>

        {/* Recipe Goals Target Chips */}
        <div className="col-span-9 sm:col-span-5 flex items-center justify-center gap-2 flex-wrap">
          {level.goals.map((goal) => {
            const meta = TILE_METAS[goal.tileType];
            const current = goalProgress[goal.tileType] || 0;
            const remaining = Math.max(0, goal.count - current);
            const isCompleted = remaining === 0;

            return (
              <div
                key={goal.tileType}
                className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-amber-50/80 border-amber-200 text-stone-800'
                }`}
              >
                <span className="text-xl leading-none select-none">{meta.emoji}</span>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] font-bold uppercase text-stone-500">
                    {meta.name}
                  </span>
                  <span className="text-sm font-black">
                    {isCompleted ? (
                      <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                        ✓ Done
                      </span>
                    ) : (
                      <span>
                        {current}
                        <span className="text-stone-400 font-medium">/{goal.count}</span>
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Score & Stars Progress Bar */}
        <div className="col-span-12 sm:col-span-4 flex flex-col justify-center px-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-stone-600">Score: {score.toLocaleString()}</span>
            <div className="flex items-center gap-0.5 text-sm">
              <span className={starsEarned >= 1 ? 'text-amber-400 drop-shadow-xs' : 'text-stone-200'}>
                ★
              </span>
              <span className={starsEarned >= 2 ? 'text-amber-400 drop-shadow-xs' : 'text-stone-200'}>
                ★
              </span>
              <span className={starsEarned >= 3 ? 'text-amber-400 drop-shadow-xs' : 'text-stone-200'}>
                ★
              </span>
            </div>
          </div>

          {/* Progress Bar with Star Markers */}
          <div className="relative w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-full transition-all duration-300"
              style={{ width: `${scorePercent}%` }}
            />
            {/* Star Milestone Indicators */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-stone-300"
              style={{ left: `${(star1 / star3) * 100}%` }}
              title={`1 Star: ${star1}`}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-stone-300"
              style={{ left: `${(star2 / star3) * 100}%` }}
              title={`2 Stars: ${star2}`}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
