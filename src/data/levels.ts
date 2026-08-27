import { LevelConfig, TileType } from '../types';

export interface TileMeta {
  type: TileType;
  name: string;
  emoji: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  shadowColor: string;
}

export const TILE_METAS: Record<TileType, TileMeta> = {
  cupcake: {
    type: 'cupcake',
    name: 'Cupcake',
    emoji: '🧁',
    color: '#F472B6',
    bgGradient: 'linear-gradient(135deg, #FCE7F3 0%, #F472B6 100%)',
    borderColor: '#EC4899',
    shadowColor: 'rgba(236, 72, 153, 0.3)',
  },
  donut: {
    type: 'donut',
    name: 'Donut',
    emoji: '🍩',
    color: '#FB923C',
    bgGradient: 'linear-gradient(135deg, #FFEDD5 0%, #FB923C 100%)',
    borderColor: '#F97316',
    shadowColor: 'rgba(249, 115, 22, 0.3)',
  },
  cookie: {
    type: 'cookie',
    name: 'Cookie',
    emoji: '🍪',
    color: '#D97706',
    bgGradient: 'linear-gradient(135deg, #FEF3C7 0%, #D97706 100%)',
    borderColor: '#B45309',
    shadowColor: 'rgba(217, 119, 6, 0.3)',
  },
  icecream: {
    type: 'icecream',
    name: 'Ice Cream',
    emoji: '🍦',
    color: '#38BDF8',
    bgGradient: 'linear-gradient(135deg, #E0F2FE 0%, #38BDF8 100%)',
    borderColor: '#0284C7',
    shadowColor: 'rgba(56, 189, 248, 0.3)',
  },
  macaron: {
    type: 'macaron',
    name: 'Macaron',
    emoji: '🍬',
    color: '#A855F7',
    bgGradient: 'linear-gradient(135deg, #F3E8FF 0%, #A855F7 100%)',
    borderColor: '#9333EA',
    shadowColor: 'rgba(168, 85, 247, 0.3)',
  },
  strawberry: {
    type: 'strawberry',
    name: 'Strawberry',
    emoji: '🍓',
    color: '#EF4444',
    bgGradient: 'linear-gradient(135deg, #FEE2E2 0%, #EF4444 100%)',
    borderColor: '#DC2626',
    shadowColor: 'rgba(239, 68, 68, 0.3)',
  },
};

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Sugar Rush Start',
    subtitle: 'Morning Prep at the Bakery',
    moves: 20,
    targetScore: 2500,
    starScores: [1500, 3000, 5000],
    availableTileTypes: ['cupcake', 'donut', 'cookie', 'icecream'],
    goals: [
      { tileType: 'cupcake', count: 12 },
    ],
  },
  {
    id: 2,
    name: 'Donut Delights',
    subtitle: 'Glazing Fresh Treats',
    moves: 22,
    targetScore: 3500,
    starScores: [2500, 4500, 7000],
    availableTileTypes: ['cupcake', 'donut', 'cookie', 'icecream'],
    goals: [
      { tileType: 'donut', count: 15 },
      { tileType: 'cookie', count: 10 },
    ],
  },
  {
    id: 3,
    name: 'Frosting Frenzy',
    subtitle: 'Sweet Confectionery Wave',
    moves: 24,
    targetScore: 5000,
    starScores: [3500, 6000, 9500],
    availableTileTypes: ['cupcake', 'donut', 'cookie', 'icecream', 'macaron'],
    goals: [
      { tileType: 'cupcake', count: 16 },
      { tileType: 'icecream', count: 14 },
    ],
  },
  {
    id: 4,
    name: 'Candy Concoctions',
    subtitle: 'Mixing Rainbow Flavors',
    moves: 25,
    targetScore: 6500,
    starScores: [4500, 7500, 11000],
    availableTileTypes: ['cupcake', 'donut', 'cookie', 'icecream', 'macaron'],
    goals: [
      { tileType: 'macaron', count: 18 },
      { tileType: 'donut', count: 16 },
    ],
  },
  {
    id: 5,
    name: 'Berry Sweet Tart',
    subtitle: 'Fresh Strawberries Arrive!',
    moves: 26,
    targetScore: 8000,
    starScores: [5500, 9000, 13000],
    availableTileTypes: ['cupcake', 'donut', 'cookie', 'icecream', 'macaron', 'strawberry'],
    goals: [
      { tileType: 'strawberry', count: 18 },
      { tileType: 'cupcake', count: 16 },
    ],
  },
  {
    id: 6,
    name: 'Chef’s Special Trio',
    subtitle: 'Triple Dessert Challenge',
    moves: 25,
    targetScore: 9000,
    starScores: [6000, 10000, 14500],
    availableTileTypes: ['cupcake', 'donut', 'cookie', 'icecream', 'macaron', 'strawberry'],
    goals: [
      { tileType: 'cookie', count: 15 },
      { tileType: 'icecream', count: 15 },
      { tileType: 'strawberry', count: 15 },
    ],
  },
  {
    id: 7,
    name: 'Bakery Rush Hour',
    subtitle: 'Rapid Customer Orders',
    moves: 22,
    targetScore: 10500,
    starScores: [7500, 12000, 17000],
    availableTileTypes: ['cupcake', 'donut', 'cookie', 'icecream', 'macaron', 'strawberry'],
    goals: [
      { tileType: 'donut', count: 20 },
      { tileType: 'macaron', count: 20 },
    ],
  },
  {
    id: 8,
    name: 'Whisk Master Recipe',
    subtitle: 'Create Special Blasts',
    moves: 24,
    targetScore: 12000,
    starScores: [8500, 14000, 20000],
    availableTileTypes: ['cupcake', 'donut', 'cookie', 'icecream', 'macaron', 'strawberry'],
    goals: [
      { tileType: 'cupcake', count: 22 },
      { tileType: 'strawberry', count: 20 },
      { tileType: 'cookie', count: 18 },
    ],
  },
  {
    id: 9,
    name: 'Sugar Showdown',
    subtitle: 'The Master Baker Exam',
    moves: 22,
    targetScore: 14000,
    starScores: [10000, 16500, 23000],
    availableTileTypes: ['cupcake', 'donut', 'cookie', 'icecream', 'macaron', 'strawberry'],
    goals: [
      { tileType: 'macaron', count: 22 },
      { tileType: 'icecream', count: 22 },
      { tileType: 'donut', count: 20 },
    ],
  },
  {
    id: 10,
    name: 'Grand Pastry Palace',
    subtitle: 'The Ultimate Dessert Buffet',
    moves: 25,
    targetScore: 18000,
    starScores: [12000, 20000, 28000],
    availableTileTypes: ['cupcake', 'donut', 'cookie', 'icecream', 'macaron', 'strawberry'],
    goals: [
      { tileType: 'cupcake', count: 24 },
      { tileType: 'strawberry', count: 24 },
      { tileType: 'donut', count: 24 },
      { tileType: 'cookie', count: 24 },
    ],
  },
];
