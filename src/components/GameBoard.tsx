import React, { useState, useRef } from 'react';
import { BoosterType, FloatingText, Particle, Tile } from '../types';
import { BOARD_SIZE } from '../utils/gameLogic';
import { TILE_METAS } from '../data/levels';

interface GameBoardProps {
  board: (Tile | null)[][];
  selectedTile: { row: number; col: number } | null;
  hintCoords: { r1: number; c1: number; r2: number; c2: number } | null;
  activeBooster: BoosterType | null;
  isProcessing: boolean;
  floatingTexts: FloatingText[];
  particles: Particle[];
  onTileClick: (row: number, col: number) => void;
  onTileSwap: (r1: number, c1: number, r2: number, c2: number) => void;
  onApplyBooster: (row: number, col: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  selectedTile,
  hintCoords,
  activeBooster,
  isProcessing,
  floatingTexts,
  particles,
  onTileClick,
  onTileSwap,
  onApplyBooster,
}) => {
  const [hoverCoord, setHoverCoord] = useState<{ row: number; col: number } | null>(null);
  const dragStartRef = useRef<{ row: number; col: number; startX: number; startY: number } | null>(
    null
  );

  // Handle Touch/Mouse Drag Start
  const handlePointerDown = (row: number, col: number, e: React.PointerEvent) => {
    if (isProcessing) return;

    if (activeBooster) {
      onApplyBooster(row, col);
      return;
    }

    dragStartRef.current = {
      row,
      col,
      startX: e.clientX,
      startY: e.clientY,
    };
  };

  // Handle Touch/Mouse Drag Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current || isProcessing || activeBooster) return;

    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    const threshold = 22; // Drag sensitivity in pixels

    const { row, col } = dragStartRef.current;

    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      dragStartRef.current = null; // Consume drag

      let targetR = row;
      let targetC = col;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swap
        targetC = dx > 0 ? col + 1 : col - 1;
      } else {
        // Vertical swap
        targetR = dy > 0 ? row + 1 : row - 1;
      }

      if (targetR >= 0 && targetR < BOARD_SIZE && targetC >= 0 && targetC < BOARD_SIZE) {
        onTileSwap(row, col, targetR, targetC);
      }
    }
  };

  // Handle Pointer Up (Standard Click/Tap)
  const handlePointerUp = (row: number, col: number) => {
    if (dragStartRef.current && !isProcessing && !activeBooster) {
      onTileClick(row, col);
    }
    dragStartRef.current = null;
  };

  return (
    <div className="relative flex items-center justify-center p-2 sm:p-4 select-none touch-none">
      {/* Outer Countertop Frame */}
      <div
        id="game-board-container"
        className="relative bg-amber-100/90 rounded-3xl p-3 sm:p-4 shadow-xl border-4 border-amber-300/80 backdrop-blur-sm max-w-[460px] w-full aspect-square"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => {
          dragStartRef.current = null;
          setHoverCoord(null);
        }}
      >
        {/* Inner Grid Container */}
        <div className="grid grid-cols-8 grid-rows-8 gap-1 sm:gap-1.5 w-full h-full bg-amber-950/10 rounded-2xl p-1.5 sm:p-2 border border-amber-900/10">
          {board.map((rowArr, r) =>
            rowArr.map((tile, c) => {
              const isSelected = selectedTile?.row === r && selectedTile?.col === c;
              const isHint =
                hintCoords &&
                ((hintCoords.r1 === r && hintCoords.c1 === c) ||
                  (hintCoords.r2 === r && hintCoords.c2 === c));

              // Active booster highlight checks
              const isBoosterTarget =
                activeBooster === 'spoon' && hoverCoord?.row === r && hoverCoord?.col === c;
              const isRowBoosterTarget = activeBooster === 'rolling_pin' && hoverCoord?.row === r;
              const isColBoosterTarget = activeBooster === 'whisk' && hoverCoord?.col === c;

              const isHighlighted = isBoosterTarget || isRowBoosterTarget || isColBoosterTarget;

              const meta = tile ? TILE_METAS[tile.type] : null;

              return (
                <div
                  key={`cell-${r}-${c}`}
                  id={`cell-${r}-${c}`}
                  onPointerDown={(e) => handlePointerDown(r, c, e)}
                  onPointerUp={() => handlePointerUp(r, c)}
                  onPointerEnter={() => setHoverCoord({ row: r, col: c })}
                  className={`relative flex items-center justify-center rounded-xl sm:rounded-2xl transition-transform duration-150 cursor-pointer overflow-hidden ${
                    (r + c) % 2 === 0 ? 'bg-amber-50/50' : 'bg-orange-50/50'
                  } ${isSelected ? 'scale-105 z-20' : ''} ${
                    isHighlighted ? 'bg-rose-200/80 ring-2 ring-rose-400 z-10' : ''
                  }`}
                >
                  {tile && meta && (
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center rounded-xl sm:rounded-2xl relative shadow-xs transition-all duration-200 ${
                        tile.isMatched ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                      } ${isSelected ? 'ring-3 ring-amber-500 shadow-md animate-bounce' : ''} ${
                        isHint ? 'animate-pulse ring-2 ring-yellow-400' : ''
                      }`}
                      style={{
                        background:
                          tile.special === 'rainbow'
                            ? 'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)'
                            : meta.bgGradient,
                        border: `2px solid ${
                          tile.special === 'rainbow' ? '#F43F5E' : meta.borderColor
                        }`,
                      }}
                    >
                      {/* Special Indicator Overlays */}
                      {tile.special === 'row_blaster' && (
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-pulse pointer-events-none rounded-xl"
                          title="Row Blaster"
                        >
                          <span className="absolute top-0.5 right-0.5 text-[10px] font-black text-white bg-rose-600/80 rounded-full px-1 leading-tight shadow-xs">
                            ↔
                          </span>
                        </div>
                      )}

                      {tile.special === 'col_blaster' && (
                        <div
                          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-transparent animate-pulse pointer-events-none rounded-xl"
                          title="Column Blaster"
                        >
                          <span className="absolute top-0.5 right-0.5 text-[10px] font-black text-white bg-indigo-600/80 rounded-full px-1 leading-tight shadow-xs">
                            ↕
                          </span>
                        </div>
                      )}

                      {tile.special === 'bomb' && (
                        <div
                          className="absolute inset-0 ring-2 ring-yellow-300 bg-yellow-400/20 animate-ping rounded-xl pointer-events-none"
                          title="Oven Bomb"
                        >
                          <span className="absolute top-0.5 right-0.5 text-[10px] font-black text-white bg-amber-600/90 rounded-full px-1 leading-tight shadow-xs">
                            💥
                          </span>
                        </div>
                      )}

                      {tile.special === 'rainbow' && (
                        <div
                          className="absolute -top-1 -right-1 text-[11px] animate-spin leading-none"
                          title="Rainbow Cake"
                        >
                          ✨
                        </div>
                      )}

                      {/* Main Dessert Emoji */}
                      <span className="text-xl sm:text-2xl md:text-3xl leading-none filter drop-shadow-xs transform transition-transform group-hover:scale-110 pointer-events-none">
                        {tile.special === 'rainbow' ? '🎂' : meta.emoji}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Floating Dynamic Score & Combo Texts */}
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            className="absolute pointer-events-none font-black text-sm sm:text-base md:text-lg animate-fade-up drop-shadow-md z-30 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${ft.x}%`,
              top: `${ft.y}%`,
              color: ft.color || '#D97706',
            }}
          >
            {ft.text}
          </div>
        ))}

        {/* Floating Particles Burst */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute pointer-events-none rounded-full z-20"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.alpha,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>
    </div>
  );
};
