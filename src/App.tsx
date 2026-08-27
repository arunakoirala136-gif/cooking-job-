import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Booster,
  BoosterType,
  FloatingText,
  LevelConfig,
  Particle,
  Tile,
  TileType,
} from './types';
import { LEVELS, TILE_METAS } from './data/levels';
import {
  BOARD_SIZE,
  collapseAndRefill,
  createInitialBoard,
  findMatches,
  generateTileId,
  getHintMove,
  handleSpecialCombo,
  hasPossibleMoves,
  shuffleBoard,
} from './utils/gameLogic';
import { sound } from './utils/audio';
import { Header } from './components/Header';
import { GameBoard } from './components/GameBoard';
import { BoosterBar } from './components/BoosterBar';
import { WinModal } from './components/WinModal';
import { LoseModal } from './components/LoseModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LevelSelect } from './components/LevelSelect';

const INITIAL_BOOSTERS: Record<BoosterType, Booster> = {
  spoon: {
    id: 'spoon',
    name: 'Spoon',
    description: 'Smash any single dessert tile without using a move',
    icon: '🥄',
    count: 3,
  },
  rolling_pin: {
    id: 'rolling_pin',
    name: 'Rolling Pin',
    description: 'Roll away and clear an entire row',
    icon: '🥖',
    count: 2,
  },
  whisk: {
    id: 'whisk',
    name: 'Whisk',
    description: 'Whisk away and clear an entire column',
    icon: '🌪️',
    count: 2,
  },
  shuffle: {
    id: 'shuffle',
    name: 'Shuffle',
    description: 'Mix and shuffle all desserts on the board',
    icon: '🔄',
    count: 3,
  },
};

export default function App() {
  // Game & View State
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [view, setView] = useState<'playing' | 'level_select'>('playing');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getIsMuted());

  // Level Progression Storage
  const [progress, setProgress] = useState<{
    [levelId: number]: { stars: number; highScore: number; completed: boolean };
  }>(() => {
    const saved = localStorage.getItem('kitchen_blast_progress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      1: { stars: 0, highScore: 0, completed: false },
    };
  });

  // Boosters Storage
  const [boosters, setBoosters] = useState<Record<BoosterType, Booster>>(() => {
    const saved = localStorage.getItem('kitchen_blast_boosters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_BOOSTERS;
  });

  // Active Level Config
  const level: LevelConfig = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];

  // Gameplay State
  const [board, setBoard] = useState<Tile[][]>(() => createInitialBoard(level));
  const [score, setScore] = useState<number>(0);
  const [movesLeft, setMovesLeft] = useState<number>(level.moves);
  const [goalProgress, setGoalProgress] = useState<{ [key in TileType]?: number }>({});
  const [selectedTile, setSelectedTile] = useState<{ row: number; col: number } | null>(null);
  const [activeBooster, setActiveBooster] = useState<BoosterType | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  // Visual Effects
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hintCoords, setHintCoords] = useState<{
    r1: number;
    c1: number;
    r2: number;
    c2: number;
  } | null>(null);

  // References for Timers & Cascade Loop
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(isProcessing);
  isProcessingRef.current = isProcessing;

  // Save Progress & Boosters
  useEffect(() => {
    localStorage.setItem('kitchen_blast_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('kitchen_blast_boosters', JSON.stringify(boosters));
  }, [boosters]);

  // Reset or Start New Level
  const initLevel = useCallback((lvlId: number) => {
    const targetLevel = LEVELS.find((l) => l.id === lvlId) || LEVELS[0];
    setCurrentLevelId(lvlId);
    setBoard(createInitialBoard(targetLevel));
    setScore(0);
    setMovesLeft(targetLevel.moves);
    setGoalProgress({});
    setSelectedTile(null);
    setActiveBooster(null);
    setGameStatus('playing');
    setIsProcessing(false);
    setFloatingTexts([]);
    setParticles([]);
    setHintCoords(null);
  }, []);

  // Helper to spawn floating score text
  const addFloatingText = (text: string, x: number, y: number, color?: string) => {
    const id = `ft-${Date.now()}-${Math.random()}`;
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((ft) => ft.id !== id));
    }, 1000);
  };

  // Helper to spawn particle burst
  const addParticleBurst = (centerX: number, centerY: number, color: string) => {
    const count = 8;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 2 + Math.random() * 3;
      newParticles.push({
        id: `p-${Date.now()}-${Math.random()}`,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 5 + Math.random() * 4,
        alpha: 1,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 0.3,
            y: p.y + p.vy * 0.3 + 0.2, // gravity
            alpha: p.alpha - 0.04,
          }))
          .filter((p) => p.alpha > 0)
      );
    }, 20);
    return () => clearInterval(interval);
  }, [particles.length]);

  // Reset & restart idle hint timer
  const resetHintTimer = useCallback(() => {
    setHintCoords(null);
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }
    hintTimeoutRef.current = setTimeout(() => {
      if (!isProcessingRef.current && gameStatus === 'playing') {
        const hint = getHintMove(board);
        if (hint) {
          setHintCoords(hint);
        }
      }
    }, 5500);
  }, [board, gameStatus]);

  useEffect(() => {
    resetHintTimer();
    return () => {
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, [board, resetHintTimer]);

  // Check if current goals are completed
  const checkGoalsCompleted = (currGoals: { [key in TileType]?: number }) => {
    return level.goals.every((g) => {
      const current = currGoals[g.tileType] || 0;
      return current >= g.count;
    });
  };

  // Core Cascade Resolution Loop
  const resolveCascade = async (
    initialBoard: Tile[][],
    currentGoals: { [key in TileType]?: number },
    currentScore: number,
    remainingMoves: number,
    initialMatchesOverride?: {
      matchedCoords: { row: number; col: number }[];
      text?: string;
      isCombo?: boolean;
    },
    swapOrigin?: { r1: number; c1: number; r2: number; c2: number }
  ) => {
    setIsProcessing(true);
    let workingBoard = initialBoard.map((row) => row.map((t) => ({ ...t })));
    let workingGoals = { ...currentGoals };
    let workingScore = currentScore;
    let combo = 1;

    let isFirstStep = true;

    while (true) {
      // 1. Detect matches
      let matchResult = findMatches(workingBoard, swapOrigin);

      if (isFirstStep && initialMatchesOverride) {
        matchResult = {
          matchedCoords: initialMatchesOverride.matchedCoords,
          specialsToCreate: [],
          clearedTileTypes: initialMatchesOverride.matchedCoords
            .map((c) => workingBoard[c.row]?.[c.col]?.type)
            .filter(Boolean) as TileType[],
        };
        if (initialMatchesOverride.text) {
          addFloatingText(initialMatchesOverride.text, 50, 40, '#EC4899');
        }
      }

      isFirstStep = false;

      if (matchResult.matchedCoords.length === 0) {
        // No more matches in cascade
        break;
      }

      // Play audio
      if (matchResult.specialsToCreate.length > 0 || initialMatchesOverride?.isCombo) {
        sound.playSpecialBlast();
      } else {
        sound.playPop(combo);
      }

      // Visual combo toasts
      if (combo >= 2) {
        const comboLabels = [
          'Sweet!',
          'Tasty!',
          'Delicious!',
          'Chef’s Delight!',
          'Masterpiece!',
          'Bakery Frenzy!',
        ];
        const label = comboLabels[Math.min(combo - 2, comboLabels.length - 1)];
        addFloatingText(`COMBO x${combo}! ${label}`, 50, 48 - combo * 3, '#F59E0B');
      }

      // 2. Spawn specials & calculate score
      const matchSet = new Set(matchResult.matchedCoords.map((c) => `${c.row},${c.col}`));

      let stepScore = 0;
      matchResult.matchedCoords.forEach((coord) => {
        const tile = workingBoard[coord.row][coord.col];
        if (tile) {
          // Update goal progress
          workingGoals[tile.type] = (workingGoals[tile.type] || 0) + 1;

          // Points per tile
          const baseTileScore = 60 * combo;
          stepScore += baseTileScore;

          // Add particle burst
          const xPercent = ((coord.col + 0.5) / BOARD_SIZE) * 100;
          const yPercent = ((coord.row + 0.5) / BOARD_SIZE) * 100;
          addParticleBurst(xPercent, yPercent, TILE_METAS[tile.type].color);
        }
      });

      // Extra bonus for large matches
      if (matchResult.matchedCoords.length >= 4) {
        stepScore += 150 * combo;
      }
      if (matchResult.matchedCoords.length >= 5) {
        stepScore += 300 * combo;
      }

      workingScore += stepScore;
      setScore(workingScore);
      setGoalProgress({ ...workingGoals });

      // Mark tiles as matched in board for pop animation
      workingBoard = workingBoard.map((rowArr, r) =>
        rowArr.map((t, c) => {
          if (matchSet.has(`${r},${c}`)) {
            return { ...t, isMatched: true };
          }
          return t;
        })
      );
      setBoard(workingBoard);

      // Wait 180ms for pop animation
      await new Promise((res) => setTimeout(res, 180));

      // Clear matched tiles, preserving newly created specials
      const preCollapseBoard: (Tile | null)[][] = workingBoard.map((rowArr, r) =>
        rowArr.map((t, c) => {
          if (matchSet.has(`${r},${c}`)) {
            // Check if a special is scheduled to spawn here
            const specialSpawn = matchResult.specialsToCreate.find(
              (s) => s.row === r && s.col === c
            );
            if (specialSpawn) {
              return {
                id: generateTileId(),
                type: specialSpawn.type,
                special: specialSpawn.special,
                row: r,
                col: c,
              };
            }
            return null;
          }
          return t;
        })
      );

      // Collapse and refill
      const { newBoard } = collapseAndRefill(preCollapseBoard, level);
      workingBoard = newBoard;
      setBoard(workingBoard);

      // Wait 220ms for drop animation
      await new Promise((res) => setTimeout(res, 220));

      combo++;
    }

    // Cascade complete! Check win/lose conditions
    const hasWon = checkGoalsCompleted(workingGoals);

    if (hasWon) {
      sound.playWin();
      // Calculate remaining moves bonus (150 pts per move)
      const bonus = remainingMoves * 150;
      const finalScore = workingScore + bonus;
      setScore(finalScore);

      const [s1, s2, s3] = level.starScores;
      const earnedStars =
        finalScore >= s3 ? 3 : finalScore >= s2 ? 2 : finalScore >= s1 ? 1 : 1;

      // Update progress
      setProgress((prev) => {
        const old = prev[level.id];
        return {
          ...prev,
          [level.id]: {
            stars: Math.max(old?.stars || 0, earnedStars),
            highScore: Math.max(old?.highScore || 0, finalScore),
            completed: true,
          },
          // Unlock next level
          ...(level.id < LEVELS.length
            ? {
                [level.id + 1]: {
                  stars: prev[level.id + 1]?.stars || 0,
                  highScore: prev[level.id + 1]?.highScore || 0,
                  completed: prev[level.id + 1]?.completed || false,
                },
              }
            : {}),
        };
      });

      setGameStatus('won');
    } else if (remainingMoves <= 0) {
      sound.playLose();
      setGameStatus('lost');
    } else {
      // Check if board has valid moves
      if (!hasPossibleMoves(workingBoard)) {
        addFloatingText('No moves! Shuffling Bakery...', 50, 50, '#EC4899');
        sound.playSpecialBlast();
        await new Promise((res) => setTimeout(res, 500));
        const shuffled = shuffleBoard(workingBoard, level);
        workingBoard = shuffled;
        setBoard(shuffled);
      }
    }

    setIsProcessing(false);
  };

  // Handle Tile Click / Select
  const handleTileClick = (row: number, col: number) => {
    if (isProcessing || gameStatus !== 'playing') return;

    if (!selectedTile) {
      sound.playClick();
      setSelectedTile({ row, col });
      setHintCoords(null);
    } else {
      // If clicked the same tile, deselect
      if (selectedTile.row === row && selectedTile.col === col) {
        setSelectedTile(null);
        return;
      }

      // If adjacent, perform swap
      const dist = Math.abs(selectedTile.row - row) + Math.abs(selectedTile.col - col);
      if (dist === 1) {
        handleTileSwap(selectedTile.row, selectedTile.col, row, col);
        setSelectedTile(null);
      } else {
        // Select new tile
        sound.playClick();
        setSelectedTile({ row, col });
      }
    }
  };

  // Handle Tile Swap
  const handleTileSwap = async (r1: number, c1: number, r2: number, c2: number) => {
    if (isProcessing || gameStatus !== 'playing' || movesLeft <= 0) return;

    const tile1 = board[r1][c1];
    const tile2 = board[r2][c2];
    if (!tile1 || !tile2) return;

    // Deduct 1 move
    const newMoves = movesLeft - 1;
    setMovesLeft(newMoves);
    setSelectedTile(null);
    setHintCoords(null);

    // 1. Swap tiles in temp board
    const tempBoard = board.map((rowArr) => rowArr.map((t) => ({ ...t })));
    tempBoard[r1][c1] = { ...tile2, row: r1, col: c1 };
    tempBoard[r2][c2] = { ...tile1, row: r2, col: c2 };

    // 2. Check for special direct combo (e.g. Rainbow + Tile, Bomb + Whisk)
    const specialCombo = handleSpecialCombo(tempBoard[r1][c1], tempBoard[r2][c2], tempBoard);

    if (specialCombo.isCombo) {
      sound.playSwap();
      setBoard(tempBoard);
      await resolveCascade(
        tempBoard,
        goalProgress,
        score,
        newMoves,
        {
          matchedCoords: specialCombo.matchedCoords,
          text: specialCombo.text,
          isCombo: true,
        },
        { r1, c1, r2, c2 }
      );
      return;
    }

    // 3. Regular match detection
    const match = findMatches(tempBoard, { r1, c1, r2, c2 });

    if (match.matchedCoords.length > 0) {
      sound.playSwap();
      setBoard(tempBoard);
      await resolveCascade(tempBoard, goalProgress, score, newMoves, undefined, {
        r1,
        c1,
        r2,
        c2,
      });
    } else {
      // Invalid move! Swap visually then swap back
      sound.playInvalid();
      setBoard(tempBoard);
      setIsProcessing(true);
      await new Promise((res) => setTimeout(res, 200));
      // Swap back and restore move
      setBoard(board);
      setMovesLeft(movesLeft);
      setIsProcessing(false);
    }
  };

  // Booster selection and execution
  const handleSelectBooster = (type: BoosterType) => {
    if (isProcessing || gameStatus !== 'playing') return;
    if (boosters[type].count <= 0) return;

    if (type === 'shuffle') {
      // Instant execution: shuffle board
      sound.playBooster();
      setBoosters((prev) => ({
        ...prev,
        shuffle: { ...prev.shuffle, count: prev.shuffle.count - 1 },
      }));
      const shuffled = shuffleBoard(board, level);
      setBoard(shuffled);
      addFloatingText('Chef Shuffle!', 50, 50, '#EC4899');
    } else {
      // Toggle active targeting booster
      if (activeBooster === type) {
        setActiveBooster(null);
      } else {
        sound.playClick();
        setActiveBooster(type);
      }
    }
  };

  const handleApplyBooster = async (row: number, col: number) => {
    if (!activeBooster || isProcessing || gameStatus !== 'playing') return;
    const booster = activeBooster;
    setActiveBooster(null);

    // Deduct booster count
    setBoosters((prev) => ({
      ...prev,
      [booster]: { ...prev[booster], count: Math.max(0, prev[booster].count - 1) },
    }));

    sound.playBooster();

    const matchedCoords: { row: number; col: number }[] = [];

    if (booster === 'spoon') {
      matchedCoords.push({ row, col });
      addFloatingText('Spoon Smash!', 50, 45, '#F59E0B');
    } else if (booster === 'rolling_pin') {
      for (let c = 0; c < BOARD_SIZE; c++) {
        matchedCoords.push({ row, col: c });
      }
      addFloatingText('Rolling Pin Sweep!', 50, 45, '#F59E0B');
    } else if (booster === 'whisk') {
      for (let r = 0; r < BOARD_SIZE; r++) {
        matchedCoords.push({ row: r, col });
      }
      addFloatingText('Whisk Swirl!', 50, 45, '#F59E0B');
    }

    await resolveCascade(board, goalProgress, score, movesLeft, {
      matchedCoords,
      isCombo: true,
    });
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleResetProgress = () => {
    const fresh = { 1: { stars: 0, highScore: 0, completed: false } };
    setProgress(fresh);
    setBoosters(INITIAL_BOOSTERS);
    localStorage.removeItem('kitchen_blast_progress');
    localStorage.removeItem('kitchen_blast_boosters');
    initLevel(1);
    setView('playing');
  };

  // Bonus points computation for victory
  const movesBonus = movesLeft * 150;
  const [s1, s2, s3] = level.starScores;
  const starsEarned = score >= s3 ? 3 : score >= s2 ? 2 : score >= s1 ? 1 : 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-orange-100 flex flex-col justify-between text-stone-800 font-sans select-none overflow-x-hidden">
      {view === 'level_select' ? (
        <LevelSelect
          progress={progress}
          onSelectLevel={(lvlId) => {
            initLevel(lvlId);
            setView('playing');
          }}
          onBackToGame={() => setView('playing')}
          onResetProgress={handleResetProgress}
        />
      ) : (
        <>
          {/* Header Panel */}
          <Header
            level={level}
            score={score}
            movesLeft={movesLeft}
            goalProgress={goalProgress}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onOpenLevelSelect={() => setView('level_select')}
            onOpenHelp={() => setIsHelpOpen(true)}
            onRestartLevel={() => initLevel(currentLevelId)}
          />

          {/* Central Match-3 Game Board */}
          <main className="flex-1 flex items-center justify-center">
            <GameBoard
              board={board}
              selectedTile={selectedTile}
              hintCoords={hintCoords}
              activeBooster={activeBooster}
              isProcessing={isProcessing}
              floatingTexts={floatingTexts}
              particles={particles}
              onTileClick={handleTileClick}
              onTileSwap={handleTileSwap}
              onApplyBooster={handleApplyBooster}
            />
          </main>

          {/* Bottom Kitchen Tools Booster Tray */}
          <BoosterBar
            boosters={boosters}
            activeBooster={activeBooster}
            isProcessing={isProcessing}
            onSelectBooster={handleSelectBooster}
            onCancelBooster={() => setActiveBooster(null)}
          />

          {/* Win Modal */}
          {gameStatus === 'won' && (
            <WinModal
              level={level}
              score={score - movesBonus}
              movesLeft={movesLeft}
              bonusScore={movesBonus}
              totalScore={score}
              stars={starsEarned}
              hasNextLevel={currentLevelId < LEVELS.length}
              onNextLevel={() => initLevel(currentLevelId + 1)}
              onReplay={() => initLevel(currentLevelId)}
              onLevelSelect={() => setView('level_select')}
            />
          )}

          {/* Lose Modal */}
          {gameStatus === 'lost' && (
            <LoseModal
              level={level}
              score={score}
              goalProgress={goalProgress}
              onRetry={() => initLevel(currentLevelId)}
              onLevelSelect={() => setView('level_select')}
            />
          )}

          {/* Recipe / How to Play Modal */}
          {isHelpOpen && <HowToPlayModal onClose={() => setIsHelpOpen(false)} />}
        </>
      )}
    </div>
  );
}
