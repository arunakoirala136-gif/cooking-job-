import { LevelConfig, SpecialType, Tile, TileType } from '../types';

export const BOARD_SIZE = 8;

// Helper to generate a unique tile ID
let tileIdCounter = 0;
export function generateTileId(): string {
  tileIdCounter += 1;
  return `tile-${tileIdCounter}-${Date.now()}`;
}

// Get a random tile type from the level's allowed types
export function getRandomTileType(availableTypes: TileType[]): TileType {
  const index = Math.floor(Math.random() * availableTypes.length);
  return availableTypes[index];
}

// Create initial 8x8 board without pre-existing matches
export function createInitialBoard(level: LevelConfig): Tile[][] {
  const board: (Tile | null)[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      let allowedTypes = [...level.availableTileTypes];

      // Avoid horizontal 3-in-a-row
      if (c >= 2) {
        const left1 = board[r][c - 1]?.type;
        const left2 = board[r][c - 2]?.type;
        if (left1 && left1 === left2) {
          allowedTypes = allowedTypes.filter((t) => t !== left1);
        }
      }

      // Avoid vertical 3-in-a-row
      if (r >= 2) {
        const top1 = board[r - 1][c]?.type;
        const top2 = board[r - 2][c]?.type;
        if (top1 && top1 === top2) {
          allowedTypes = allowedTypes.filter((t) => t !== top1);
        }
      }

      // Fallback in case filter was too aggressive
      if (allowedTypes.length === 0) {
        allowedTypes = level.availableTileTypes;
      }

      const type = getRandomTileType(allowedTypes);
      board[r][c] = {
        id: generateTileId(),
        type,
        special: 'normal',
        row: r,
        col: c,
      };
    }
  }

  const concreteBoard = board as Tile[][];

  // Guarantee at least one valid starting move
  if (!hasPossibleMoves(concreteBoard)) {
    return createInitialBoard(level);
  }

  return concreteBoard;
}

// Structure representing detected matches
export interface MatchResult {
  matchedCoords: { row: number; col: number }[];
  specialsToCreate: {
    row: number;
    col: number;
    type: TileType;
    special: SpecialType;
  }[];
  clearedTileTypes: TileType[];
}

// Find all matches on the board and determine any special tiles to spawn
export function findMatches(
  board: (Tile | null)[][],
  lastSwapCoords?: { r1: number; c1: number; r2: number; c2: number }
): MatchResult {
  const matchedSet = new Set<string>();
  const specialsToCreate: MatchResult['specialsToCreate'] = [];
  const clearedTileTypes: TileType[] = [];

  // Track horizontal line matches: { row, startCol, endCol, length, type }
  interface Run {
    isHorizontal: boolean;
    rowOrCol: number;
    start: number;
    end: number;
    length: number;
    type: TileType;
  }
  const runs: Run[] = [];

  // 1. Check Horizontal Matches
  for (let r = 0; r < BOARD_SIZE; r++) {
    let matchLen = 1;
    for (let c = 0; c < BOARD_SIZE; c++) {
      const current = board[r][c];
      const next = c + 1 < BOARD_SIZE ? board[r][c + 1] : null;

      if (current && next && current.type === next.type) {
        matchLen++;
      } else {
        if (matchLen >= 3 && current) {
          runs.push({
            isHorizontal: true,
            rowOrCol: r,
            start: c - matchLen + 1,
            end: c,
            length: matchLen,
            type: current.type,
          });
          for (let k = c - matchLen + 1; k <= c; k++) {
            matchedSet.add(`${r},${k}`);
          }
        }
        matchLen = 1;
      }
    }
  }

  // 2. Check Vertical Matches
  for (let c = 0; c < BOARD_SIZE; c++) {
    let matchLen = 1;
    for (let r = 0; r < BOARD_SIZE; r++) {
      const current = board[r][c];
      const next = r + 1 < BOARD_SIZE ? board[r + 1][c] : null;

      if (current && next && current.type === next.type) {
        matchLen++;
      } else {
        if (matchLen >= 3 && current) {
          runs.push({
            isHorizontal: false,
            rowOrCol: c,
            start: r - matchLen + 1,
            end: r,
            length: matchLen,
            type: current.type,
          });
          for (let k = r - matchLen + 1; k <= r; k++) {
            matchedSet.add(`${k},${c}`);
          }
        }
        matchLen = 1;
      }
    }
  }

  // 3. Determine Specials to Spawn (Rainbow, Bomb, Whisk)
  const hRuns = runs.filter((r) => r.isHorizontal);
  const vRuns = runs.filter((r) => !r.isHorizontal);
  const usedRuns = new Set<Run>();

  // Helper to pick spawn location (prefer the swapped tile if it falls in the run)
  const chooseSpawnCoord = (coords: { r: number; c: number }[]) => {
    if (lastSwapCoords) {
      const match1 = coords.find(
        (co) => co.r === lastSwapCoords.r1 && co.c === lastSwapCoords.c1
      );
      if (match1) return match1;
      const match2 = coords.find(
        (co) => co.r === lastSwapCoords.r2 && co.c === lastSwapCoords.c2
      );
      if (match2) return match2;
    }
    // Default to middle of match
    return coords[Math.floor(coords.length / 2)];
  };

  // Check 5-in-a-row straight (Rainbow Sprinkle Cake)
  runs.forEach((run) => {
    if (run.length >= 5) {
      usedRuns.add(run);
      const coords: { r: number; c: number }[] = [];
      for (let i = run.start; i <= run.end; i++) {
        coords.push(run.isHorizontal ? { r: run.rowOrCol, c: i } : { r: i, c: run.rowOrCol });
      }
      const spawn = chooseSpawnCoord(coords);
      specialsToCreate.push({
        row: spawn.r,
        col: spawn.c,
        type: run.type,
        special: 'rainbow',
      });
    }
  });

  // Check L and T intersections (Oven Bomb)
  hRuns.forEach((hr) => {
    if (usedRuns.has(hr)) return;
    vRuns.forEach((vr) => {
      if (usedRuns.has(vr)) return;
      if (hr.type === vr.type) {
        // Intersection point: row = hr.rowOrCol, col = vr.rowOrCol
        const intersectR = hr.rowOrCol;
        const intersectC = vr.rowOrCol;
        if (
          intersectC >= hr.start &&
          intersectC <= hr.end &&
          intersectR >= vr.start &&
          intersectR <= vr.end
        ) {
          // Found intersection!
          usedRuns.add(hr);
          usedRuns.add(vr);
          specialsToCreate.push({
            row: intersectR,
            col: intersectC,
            type: hr.type,
            special: 'bomb',
          });
        }
      }
    });
  });

  // Check 4-in-a-row (Row / Col Blaster Whisk)
  runs.forEach((run) => {
    if (usedRuns.has(run)) return;
    if (run.length === 4) {
      usedRuns.add(run);
      const coords: { r: number; c: number }[] = [];
      for (let i = run.start; i <= run.end; i++) {
        coords.push(run.isHorizontal ? { r: run.rowOrCol, c: i } : { r: i, c: run.rowOrCol });
      }
      const spawn = chooseSpawnCoord(coords);
      // Horizontal 4 creates vertical column blaster; Vertical 4 creates horizontal row blaster
      specialsToCreate.push({
        row: spawn.r,
        col: spawn.c,
        type: run.type,
        special: run.isHorizontal ? 'col_blaster' : 'row_blaster',
      });
    }
  });

  // 4. Trigger special tile effects recursively
  const toProcessQueue = Array.from(matchedSet).map((key) => {
    const [r, c] = key.split(',').map(Number);
    return { row: r, col: c };
  });

  const fullClearedSet = new Set<string>();

  while (toProcessQueue.length > 0) {
    const curr = toProcessQueue.shift()!;
    const key = `${curr.row},${curr.col}`;
    if (fullClearedSet.has(key)) continue;
    fullClearedSet.add(key);

    const tile = board[curr.row]?.[curr.col];
    if (!tile) continue;

    clearedTileTypes.push(tile.type);

    // If tile is special, detonate surrounding/line tiles
    if (tile.special === 'row_blaster') {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const nextKey = `${curr.row},${c}`;
        if (!fullClearedSet.has(nextKey)) {
          toProcessQueue.push({ row: curr.row, col: c });
        }
      }
    } else if (tile.special === 'col_blaster') {
      for (let r = 0; r < BOARD_SIZE; r++) {
        const nextKey = `${r},${curr.col}`;
        if (!fullClearedSet.has(nextKey)) {
          toProcessQueue.push({ row: r, col: curr.col });
        }
      }
    } else if (tile.special === 'bomb') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = curr.row + dr;
          const nc = curr.col + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            const nextKey = `${nr},${nc}`;
            if (!fullClearedSet.has(nextKey)) {
              toProcessQueue.push({ row: nr, col: nc });
            }
          }
        }
      }
    }
  }

  const matchedCoords = Array.from(fullClearedSet).map((key) => {
    const [row, col] = key.split(',').map(Number);
    return { row, col };
  });

  return {
    matchedCoords,
    specialsToCreate,
    clearedTileTypes,
  };
}

// Special Combo Execution (when 2 special tiles or Rainbow is swapped directly)
export function handleSpecialCombo(
  tile1: Tile,
  tile2: Tile,
  board: (Tile | null)[][]
): { matchedCoords: { row: number; col: number }[]; isCombo: boolean; text: string } {
  // Case 1: Rainbow + Rainbow -> Clear entire board!
  if (tile1.special === 'rainbow' && tile2.special === 'rainbow') {
    const allCoords: { row: number; col: number }[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        allCoords.push({ row: r, col: c });
      }
    }
    return { matchedCoords: allCoords, isCombo: true, text: 'GRAND BAKERY BLAST!' };
  }

  // Case 2: Rainbow + Normal Tile -> Clear all tiles of that normal tile type
  if (tile1.special === 'rainbow' || tile2.special === 'rainbow') {
    const rainbowTile = tile1.special === 'rainbow' ? tile1 : tile2;
    const otherTile = tile1.special === 'rainbow' ? tile2 : tile1;

    const matchedCoords: { row: number; col: number }[] = [
      { row: rainbowTile.row, col: rainbowTile.col },
      { row: otherTile.row, col: otherTile.col },
    ];

    const targetType = otherTile.type;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const t = board[r][c];
        if (t && t.type === targetType) {
          matchedCoords.push({ row: r, col: c });
        }
      }
    }
    return { matchedCoords, isCombo: true, text: 'RAINBOW SPRINKLES!' };
  }

  // Case 3: Bomb + Bomb -> Huge 5x5 explosion
  if (tile1.special === 'bomb' && tile2.special === 'bomb') {
    const centerR = Math.floor((tile1.row + tile2.row) / 2);
    const centerC = Math.floor((tile1.col + tile2.col) / 2);
    const matchedCoords: { row: number; col: number }[] = [];
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const nr = centerR + dr;
        const nc = centerC + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
          matchedCoords.push({ row: nr, col: nc });
        }
      }
    }
    return { matchedCoords, isCombo: true, text: 'MEGA OVEN BLAST!' };
  }

  // Case 4: Whisk + Whisk (Row/Col Blaster + Row/Col Blaster) -> Cross Blast (Entire Row and Entire Col)
  if (
    (tile1.special === 'row_blaster' || tile1.special === 'col_blaster') &&
    (tile2.special === 'row_blaster' || tile2.special === 'col_blaster')
  ) {
    const matchedCoords: { row: number; col: number }[] = [];
    const r = tile2.row;
    const c = tile2.col;
    for (let i = 0; i < BOARD_SIZE; i++) {
      matchedCoords.push({ row: r, col: i });
      matchedCoords.push({ row: i, col: c });
    }
    return { matchedCoords, isCombo: true, text: 'CROSS WHISK BLAST!' };
  }

  // Case 5: Bomb + Whisk -> 3 Rows and 3 Columns blasted!
  if (
    (tile1.special === 'bomb' && (tile2.special === 'row_blaster' || tile2.special === 'col_blaster')) ||
    (tile2.special === 'bomb' && (tile1.special === 'row_blaster' || tile1.special === 'col_blaster'))
  ) {
    const centerR = tile2.row;
    const centerC = tile2.col;
    const matchedCoords = new Set<string>();

    for (let offset = -1; offset <= 1; offset++) {
      const r = centerR + offset;
      if (r >= 0 && r < BOARD_SIZE) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          matchedCoords.add(`${r},${c}`);
        }
      }
      const c = centerC + offset;
      if (c >= 0 && c < BOARD_SIZE) {
        for (let row = 0; row < BOARD_SIZE; row++) {
          matchedCoords.add(`${row},${c}`);
        }
      }
    }

    return {
      matchedCoords: Array.from(matchedCoords).map((k) => {
        const [row, col] = k.split(',').map(Number);
        return { row, col };
      }),
      isCombo: true,
      text: 'TRIPLE WHISK BOMB!',
    };
  }

  return { matchedCoords: [], isCombo: false, text: '' };
}

// Drops tiles down and refills empty spaces from top
export function collapseAndRefill(
  board: (Tile | null)[][],
  level: LevelConfig
): {
  newBoard: Tile[][];
  spawnedCount: number;
} {
  const newBoard: (Tile | null)[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  let spawnedCount = 0;

  for (let c = 0; c < BOARD_SIZE; c++) {
    // Collect non-empty tiles in this column from bottom to top
    const existingTiles: Tile[] = [];
    for (let r = BOARD_SIZE - 1; r >= 0; r--) {
      const tile = board[r][c];
      if (tile) {
        existingTiles.push(tile);
      }
    }

    // Place existing tiles starting from the bottom
    let writeRow = BOARD_SIZE - 1;
    existingTiles.forEach((tile) => {
      newBoard[writeRow][c] = {
        ...tile,
        row: writeRow,
        col: c,
        isMatched: false,
        isNew: false,
      };
      writeRow--;
    });

    // Fill remaining empty top slots with newly spawned tiles
    while (writeRow >= 0) {
      spawnedCount++;
      newBoard[writeRow][c] = {
        id: generateTileId(),
        type: getRandomTileType(level.availableTileTypes),
        special: 'normal',
        row: writeRow,
        col: c,
        isNew: true,
      };
      writeRow--;
    }
  }

  return {
    newBoard: newBoard as Tile[][],
    spawnedCount,
  };
}

// Check if any valid moves exist on the board
export function hasPossibleMoves(board: Tile[][]): boolean {
  return getHintMove(board) !== null;
}

// Find a valid move to suggest as a hint
export function getHintMove(
  board: Tile[][]
): { r1: number; c1: number; r2: number; c2: number } | null {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const current = board[r][c];
      if (!current) continue;

      // Check right swap
      if (c + 1 < BOARD_SIZE) {
        const right = board[r][c + 1];
        if (right) {
          // If either is rainbow or both are special, it's a valid swap!
          if (
            current.special === 'rainbow' ||
            right.special === 'rainbow' ||
            (current.special !== 'normal' && right.special !== 'normal')
          ) {
            return { r1: r, c1: c, r2: r, c2: c + 1 };
          }

          // Test swap
          const temp = board[r][c];
          board[r][c] = board[r][c + 1];
          board[r][c + 1] = temp;

          const match = findMatches(board);

          // Restore
          const restore = board[r][c];
          board[r][c] = board[r][c + 1];
          board[r][c + 1] = restore;

          if (match.matchedCoords.length > 0) {
            return { r1: r, c1: c, r2: r, c2: c + 1 };
          }
        }
      }

      // Check down swap
      if (r + 1 < BOARD_SIZE) {
        const down = board[r + 1][c];
        if (down) {
          if (
            current.special === 'rainbow' ||
            down.special === 'rainbow' ||
            (current.special !== 'normal' && down.special !== 'normal')
          ) {
            return { r1: r, c1: c, r2: r + 1, c2: c };
          }

          // Test swap
          const temp = board[r][c];
          board[r][c] = board[r + 1][c];
          board[r + 1][c] = temp;

          const match = findMatches(board);

          // Restore
          const restore = board[r][c];
          board[r][c] = board[r + 1][c];
          board[r + 1][c] = restore;

          if (match.matchedCoords.length > 0) {
            return { r1: r, c1: c, r2: r + 1, c2: c };
          }
        }
      }
    }
  }
  return null;
}

// Shuffle board when no moves remain
export function shuffleBoard(board: Tile[][], level: LevelConfig): Tile[][] {
  const flatTiles = board.flat().filter(Boolean) as Tile[];
  // Shuffle tile types and specials
  for (let i = flatTiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tempType = flatTiles[i].type;
    const tempSpecial = flatTiles[i].special;
    flatTiles[i].type = flatTiles[j].type;
    flatTiles[i].special = flatTiles[j].special;
    flatTiles[j].type = tempType;
    flatTiles[j].special = tempSpecial;
  }

  let index = 0;
  const newBoard: Tile[][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    newBoard[r] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      newBoard[r][c] = {
        ...flatTiles[index],
        row: r,
        col: c,
        isMatched: false,
      };
      index++;
    }
  }

  // If matches formed right after shuffle or no moves, clean up
  const match = findMatches(newBoard);
  if (match.matchedCoords.length > 0 || !hasPossibleMoves(newBoard)) {
    return createInitialBoard(level);
  }

  return newBoard;
}
