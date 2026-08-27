import React, { useState } from 'react';
import { Sparkles, Lock, Play, ArrowLeft, RotateCcw, Award } from 'lucide-react';
import { LevelConfig } from '../types';
import { LEVELS, TILE_METAS } from '../data/levels';

interface LevelProgress {
  [levelId: number]: {
    stars: number;
    highScore: number;
    completed: boolean;
  };
}

interface LevelSelectProps {
  progress: LevelProgress;
  onSelectLevel: (levelId: number) => void;
  onBackToGame?: () => void;
  onResetProgress: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  progress,
  onSelectLevel,
  onBackToGame,
  onResetProgress,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig | null>(null);

  // Compute total stars
  const totalStars = Object.values(progress).reduce((acc: number, curr: LevelProgress[number]) => acc + (curr?.stars || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-orange-100 p-4 flex flex-col items-center justify-start max-w-2xl mx-auto">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between py-3 mb-2">
        {onBackToGame ? (
          <button
            id="btn-back-to-game"
            onClick={onBackToGame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-stone-800 text-sm font-bold shadow-xs border border-amber-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-700" />
            <span>Resume</span>
          </button>
        ) : (
          <div className="w-8" />
        )}

        <div className="text-center">
          <h1 className="text-2xl font-black text-rose-950 flex items-center justify-center gap-2">
            <span>🧁</span> Kitchen Blast <span>🍩</span>
          </h1>
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Pastry Shop Roadmap
          </p>
        </div>

        {/* Total Stars Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-black text-sm shadow-xs">
          <span className="text-amber-500 text-base">★</span>
          <span>{totalStars} / 30</span>
        </div>
      </div>

      {/* Bakery Level Grid Map */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
        {LEVELS.map((level) => {
          const levelProg = progress[level.id];
          // Level 1 is always unlocked; subsequent levels unlock if previous level is completed
          const isUnlocked = level.id === 1 || progress[level.id - 1]?.completed;
          const starsEarned = levelProg?.stars || 0;

          return (
            <div
              key={level.id}
              id={`level-card-${level.id}`}
              onClick={() => isUnlocked && setSelectedLevel(level)}
              className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border-2 transition-all select-none ${
                isUnlocked
                  ? 'bg-white hover:bg-amber-50/80 border-amber-300 shadow-md cursor-pointer hover:scale-102 active:scale-98'
                  : 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Level Number Pin */}
              <div className="w-full flex items-center justify-between mb-1">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-xs ${
                    isUnlocked
                      ? 'bg-gradient-to-tr from-rose-500 to-orange-400 text-white'
                      : 'bg-stone-300 text-stone-600'
                  }`}
                >
                  {level.id}
                </span>

                {/* Stars or Lock */}
                {isUnlocked ? (
                  <div className="flex items-center gap-0.5 text-xs">
                    {[1, 2, 3].map((s) => (
                      <span
                        key={s}
                        className={starsEarned >= s ? 'text-amber-400 drop-shadow-xs' : 'text-stone-200'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                ) : (
                  <Lock className="w-4 h-4 text-stone-400" />
                )}
              </div>

              {/* Title & Goals preview */}
              <div className="text-center my-1.5">
                <h3 className="font-extrabold text-sm text-stone-800 leading-snug line-clamp-1">
                  {level.name}
                </h3>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {level.goals.map((g) => (
                    <span key={g.tileType} className="text-sm" title={TILE_METAS[g.tileType].name}>
                      {TILE_METAS[g.tileType].emoji}
                    </span>
                  ))}
                </div>
              </div>

              {/* High Score or Play Badge */}
              <div className="w-full mt-1 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[11px] font-semibold text-stone-500">
                <span>{level.moves} moves</span>
                {levelProg?.highScore ? (
                  <span className="text-amber-700 font-bold">{levelProg.highScore.toLocaleString()} pts</span>
                ) : isUnlocked ? (
                  <span className="text-rose-600 font-bold">New!</span>
                ) : (
                  <span>Locked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reset Progress button */}
      <div className="mt-auto pt-4 pb-2">
        <button
          id="btn-reset-progress"
          onClick={() => {
            if (window.confirm('Reset all level progress and start fresh from Level 1?')) {
              onResetProgress();
            }
          }}
          className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Saved Progress</span>
        </button>
      </div>

      {/* Level Preview Popup Modal */}
      {selectedLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-300 text-center animate-scale-up">
            <div className="w-14 h-14 mx-auto -mt-10 bg-gradient-to-tr from-amber-400 to-rose-400 rounded-full flex items-center justify-center shadow-md border-4 border-white text-2xl">
              🍰
            </div>

            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mt-2">
              Level {selectedLevel.id}
            </div>
            <h2 className="text-xl font-black text-rose-950 mb-1">{selectedLevel.name}</h2>
            <p className="text-xs text-stone-500 mb-4">{selectedLevel.subtitle}</p>

            {/* Level Goals Box */}
            <div className="bg-amber-50/80 rounded-2xl p-3 border border-amber-200 mb-4 text-left">
              <span className="text-xs font-bold text-stone-700 block mb-2">Recipe Goal:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedLevel.goals.map((g) => (
                  <div
                    key={g.tileType}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-xl border border-amber-200 shadow-xs"
                  >
                    <span className="text-xl leading-none">{TILE_METAS[g.tileType].emoji}</span>
                    <span className="text-xs font-bold text-stone-800">
                      Collect {g.count} {TILE_METAS[g.tileType].name}s
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs font-semibold text-stone-500">
                Moves limit: <strong className="text-rose-700 font-bold">{selectedLevel.moves}</strong>
              </div>
            </div>

            {/* Stars record if already played */}
            {progress[selectedLevel.id] && (
              <div className="flex items-center justify-between text-xs text-stone-600 bg-stone-50 rounded-xl p-2 mb-4 border border-stone-200">
                <span className="flex items-center gap-1 font-semibold">
                  <Award className="w-4 h-4 text-amber-500" />
                  Best Score:
                </span>
                <span className="font-bold text-stone-800">
                  {progress[selectedLevel.id].highScore.toLocaleString()} pts
                </span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                id="btn-cancel-level-preview"
                onClick={() => setSelectedLevel(null)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm cursor-pointer"
              >
                Back
              </button>
              <button
                id="btn-start-level"
                onClick={() => {
                  const id = selectedLevel.id;
                  setSelectedLevel(null);
                  onSelectLevel(id);
                }}
                className="flex-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Baking</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
