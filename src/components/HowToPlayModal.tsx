import React from 'react';
import { X, Sparkles, Wand2, Zap, HelpCircle } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border-4 border-amber-300 max-h-[90vh] overflow-y-auto animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-100 text-amber-800">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-rose-950 leading-tight">
                Chef’s Recipe Guide
              </h2>
              <p className="text-xs text-amber-800 font-semibold">
                Match-3 Rules & Special Boosters
              </p>
            </div>
          </div>
          <button
            id="btn-close-help"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Sections */}
        <div className="space-y-4 text-xs sm:text-sm text-stone-700">
          {/* Core Matching */}
          <div className="bg-amber-50/80 rounded-2xl p-3 border border-amber-200">
            <h3 className="font-black text-amber-900 flex items-center gap-1.5 mb-1">
              <span>🍰</span> 1. Match Sweet Treats
            </h3>
            <p className="leading-relaxed">
              Tap or drag adjacent tiles to match <strong className="text-stone-900">3 or more</strong> of the same dessert in a row or column. Complete the recipe goal before running out of moves!
            </p>
          </div>

          {/* Special Tiles */}
          <div className="bg-rose-50/80 rounded-2xl p-3 border border-rose-200 space-y-2.5">
            <h3 className="font-black text-rose-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-600" /> 2. Special Blast Tiles
            </h3>

            <div className="flex items-start gap-2.5">
              <span className="text-2xl bg-white p-1 rounded-xl shadow-xs border border-rose-200">
                ↔
              </span>
              <div>
                <strong className="text-stone-900 block">Whisk Tile (Match 4 in a line)</strong>
                <span className="text-stone-600">
                  Clears an entire row or column when matched or swapped!
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-2xl bg-white p-1 rounded-xl shadow-xs border border-amber-200">
                💥
              </span>
              <div>
                <strong className="text-stone-900 block">Oven Bomb (Match 5 in L or T shape)</strong>
                <span className="text-stone-600">
                  Explodes a huge 3x3 square of sweet desserts!
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-2xl bg-white p-1 rounded-xl shadow-xs border border-purple-200">
                🎂
              </span>
              <div>
                <strong className="text-stone-900 block">Rainbow Cake (Match 5 in a straight line)</strong>
                <span className="text-stone-600">
                  Swap with any dessert to clear ALL tiles of that color from the board!
                </span>
              </div>
            </div>
          </div>

          {/* Kitchen Boosters */}
          <div className="bg-orange-50/80 rounded-2xl p-3 border border-orange-200 space-y-2">
            <h3 className="font-black text-orange-900 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-orange-600" /> 3. Kitchen Tool Boosters
            </h3>
            <ul className="space-y-1.5 text-stone-600">
              <li>
                <strong>🥄 Spoon:</strong> Tap any single tile to smash it without using a move.
              </li>
              <li>
                <strong>🥖 Rolling Pin:</strong> Tap any tile to roll away its entire row.
              </li>
              <li>
                <strong>🌪️ Whisk:</strong> Tap any tile to whisk away its entire column.
              </li>
              <li>
                <strong>🔄 Chef Shuffle:</strong> Mix all tiles on the board for new combinations.
              </li>
            </ul>
          </div>
        </div>

        {/* Got it button */}
        <button
          id="btn-got-it"
          onClick={onClose}
          className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-md transition-transform active:scale-95 cursor-pointer"
        >
          Let’s Bake!
        </button>
      </div>
    </div>
  );
};
