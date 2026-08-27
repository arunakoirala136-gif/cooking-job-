import React from 'react';
import { RotateCcw, Map, AlertCircle } from 'lucide-react';
import { LevelConfig, TileType } from '../types';
import { TILE_METAS } from '../data/levels';

interface LoseModalProps {
  level: LevelConfig;
  score: number;
  goalProgress: { [key in TileType]?: number };
  onRetry: () => void;
  onLevelSelect: () => void;
}

export const LoseModal: React.FC<LoseModalProps> = ({
  level,
  score,
  goalProgress,
  onRetry,
  onLevelSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-4 border-rose-300 text-center animate-scale-up">
        {/* Sad Chef/Baking Badge */}
        <div className="w-16 h-16 mx-auto -mt-12 bg-gradient-to-tr from-stone-400 to-rose-400 rounded-full flex items-center justify-center shadow-lg border-4 border-white text-3xl">
          🥺
        </div>

        <h2 className="text-2xl font-black text-stone-800 mt-3 flex items-center justify-center gap-1.5">
          <AlertCircle className="w-6 h-6 text-rose-500" />
          Out of Moves!
        </h2>
        <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">
          Level {level.id}: {level.name}
        </p>

        {/* Missing Goals Summary */}
        <div className="bg-rose-50/70 rounded-2xl p-3 border border-rose-200 mb-4 text-left">
          <span className="text-xs font-bold text-rose-800 block mb-2">Recipe Goals Needed:</span>
          <div className="space-y-1.5">
            {level.goals.map((goal) => {
              const meta = TILE_METAS[goal.tileType];
              const current = goalProgress[goal.tileType] || 0;
              const remaining = Math.max(0, goal.count - current);
              const isCompleted = remaining === 0;

              return (
                <div
                  key={goal.tileType}
                  className="flex items-center justify-between text-xs font-semibold"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{meta.emoji}</span>
                    <span className="text-stone-700">{meta.name}</span>
                  </div>
                  {isCompleted ? (
                    <span className="text-emerald-600 font-bold">✓ Collected</span>
                  ) : (
                    <span className="text-rose-600 font-bold">
                      {remaining} more needed ({current}/{goal.count})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-xs text-stone-500 mb-5">
          Score achieved: <span className="font-bold text-stone-700">{score.toLocaleString()}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            id="btn-retry-level"
            onClick={onRetry}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-extrabold text-base shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Try Again</span>
          </button>

          <button
            id="btn-lose-level-select"
            onClick={onLevelSelect}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Map className="w-4 h-4" />
            <span>Back to Level Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};
