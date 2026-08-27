import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, ArrowRight, RotateCcw, Map } from 'lucide-react';
import { LevelConfig } from '../types';

interface WinModalProps {
  level: LevelConfig;
  score: number;
  movesLeft: number;
  bonusScore: number;
  totalScore: number;
  stars: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  level,
  score,
  movesLeft,
  bonusScore,
  totalScore,
  stars,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onLevelSelect,
}) => {
  useEffect(() => {
    // Launch celebratory confetti burst
    const end = Date.now() + 1.5 * 1000;
    const colors = ['#F472B6', '#FB923C', '#FBBF24', '#34D399', '#60A5FA'];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-300 text-center animate-scale-up">
        {/* Chef Badge */}
        <div className="w-16 h-16 mx-auto -mt-12 bg-gradient-to-tr from-amber-400 to-rose-400 rounded-full flex items-center justify-center shadow-lg border-4 border-white text-3xl">
          👨‍🍳
        </div>

        <h2 className="text-2xl font-black text-rose-950 mt-3 flex items-center justify-center gap-1.5">
          <Sparkles className="w-6 h-6 text-amber-500" />
          Recipe Complete!
        </h2>
        <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-4">
          Level {level.id}: {level.name}
        </p>

        {/* 3-Star Rating Display */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3].map((starNum) => (
            <div
              key={starNum}
              className={`text-4xl transition-all duration-500 transform ${
                stars >= starNum
                  ? 'text-amber-400 scale-110 drop-shadow-md animate-bounce'
                  : 'text-stone-200'
              }`}
              style={{ animationDelay: `${starNum * 150}ms` }}
            >
              ★
            </div>
          ))}
        </div>

        {/* Score Breakdown Card */}
        <div className="bg-amber-50/80 rounded-2xl p-3 border border-amber-200 mb-5 space-y-1.5 text-xs sm:text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Match Points:</span>
            <span className="font-bold text-stone-800">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Moves Bonus ({movesLeft} left):</span>
            <span className="font-bold text-emerald-600">+{bonusScore.toLocaleString()}</span>
          </div>
          <div className="border-t border-amber-200 pt-1.5 flex justify-between text-sm sm:text-base font-black text-rose-900">
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              Total Score:
            </span>
            <span>{totalScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {hasNextLevel && (
            <button
              id="btn-next-level"
              onClick={onNextLevel}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-extrabold text-base shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <span>Next Recipe</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <div className="flex gap-2">
            <button
              id="btn-replay-level"
              onClick={onReplay}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay</span>
            </button>
            <button
              id="btn-win-level-select"
              onClick={onLevelSelect}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Map className="w-4 h-4" />
              <span>Level Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
