import React from 'react';
import { Booster, BoosterType } from '../types';
import { X } from 'lucide-react';

interface BoosterBarProps {
  boosters: Record<BoosterType, Booster>;
  activeBooster: BoosterType | null;
  isProcessing: boolean;
  onSelectBooster: (type: BoosterType) => void;
  onCancelBooster: () => void;
}

export const BoosterBar: React.FC<BoosterBarProps> = ({
  boosters,
  activeBooster,
  isProcessing,
  onSelectBooster,
  onCancelBooster,
}) => {
  const boosterList: Booster[] = Object.values(boosters);

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-4">
      {/* Active Booster Prompt Banner */}
      {activeBooster && (
        <div className="mb-2 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between shadow-xs animate-pulse">
          <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
            <span>{boosters[activeBooster].icon}</span>
            <span>
              {activeBooster === 'spoon' && 'Tap any single tile to smash it!'}
              {activeBooster === 'rolling_pin' && 'Tap a tile to clear its row!'}
              {activeBooster === 'whisk' && 'Tap a tile to clear its column!'}
            </span>
          </div>
          <button
            id="btn-cancel-booster"
            onClick={onCancelBooster}
            className="p-1 rounded-lg bg-rose-200 hover:bg-rose-300 text-rose-800 cursor-pointer"
            title="Cancel Booster"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Boosters Tray */}
      <div className="flex items-center justify-around gap-2 bg-amber-50/90 backdrop-blur-xs p-2 rounded-2xl border-2 border-amber-200 shadow-sm">
        {boosterList.map((booster) => {
          const isActive = activeBooster === booster.id;
          const isUsable = booster.count > 0 && !isProcessing;

          return (
            <button
              key={booster.id}
              id={`booster-${booster.id}`}
              onClick={() => onSelectBooster(booster.id)}
              disabled={!isUsable}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-rose-500 border-rose-600 text-white shadow-md scale-105 ring-2 ring-rose-300'
                  : isUsable
                  ? 'bg-white hover:bg-amber-100 border-amber-200 text-stone-800 active:scale-95 shadow-xs'
                  : 'bg-stone-100 border-stone-200 text-stone-400 opacity-50 cursor-not-allowed'
              }`}
              title={`${booster.name}: ${booster.description}`}
            >
              <span className="text-xl sm:text-2xl leading-none mb-0.5">{booster.icon}</span>
              <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">
                {booster.name}
              </span>

              {/* Remaining Count Badge */}
              <span
                className={`absolute -top-1.5 -right-1.5 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs ${
                  booster.count > 0 ? 'bg-amber-500 text-white' : 'bg-stone-300 text-stone-600'
                }`}
              >
                {booster.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
