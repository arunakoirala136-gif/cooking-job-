export type TileType = 'cupcake' | 'donut' | 'cookie' | 'icecream' | 'macaron' | 'strawberry';

export type SpecialType = 'normal' | 'row_blaster' | 'col_blaster' | 'bomb' | 'rainbow';

export interface Tile {
  id: string;
  type: TileType;
  special: SpecialType;
  row: number;
  col: number;
  isMatched?: boolean;
  isNew?: boolean;
  isHint?: boolean;
}

export interface LevelGoal {
  type: 'collect';
  tileType: TileType;
  count: number;
  current: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  moves: number;
  targetScore: number;
  starScores: [number, number, number];
  availableTileTypes: TileType[];
  goals: {
    tileType: TileType;
    count: number;
  }[];
}

export type BoosterType = 'spoon' | 'rolling_pin' | 'whisk' | 'shuffle';

export interface Booster {
  id: BoosterType;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export type GameView = 'menu' | 'level_select' | 'playing' | 'how_to_play';

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color?: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  emoji?: string;
}
