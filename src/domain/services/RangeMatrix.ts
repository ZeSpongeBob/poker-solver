import { Rank, RANKS } from '../entities/Card';

export type ComboKey = string;

export interface ComboCell {
  key: ComboKey;
  hand: string;
  row: number;
  col: number;
}

const descRanks = [...RANKS].reverse();

export const buildHandLabel = (r1: Rank, r2: Rank): string => {
  if (r1 === r2) return `${r1}${r2}`;
  const i1 = descRanks.indexOf(r1);
  const i2 = descRanks.indexOf(r2);
  if (i1 < i2) return `${r1}${r2}s`;
  return `${r2}${r1}o`;
};

export const createRangeGrid = (): ComboCell[] => {
  const cells: ComboCell[] = [];
  descRanks.forEach((r1, row) => {
    descRanks.forEach((r2, col) => {
      const hand = buildHandLabel(r1, r2);
      cells.push({ key: `${row}-${col}`, hand, row, col });
    });
  });
  return cells;
};

export const defaultRangeWeights = (): Record<ComboKey, number> => {
  const grid = createRangeGrid();
  return Object.fromEntries(grid.map((c) => [c.key, c.hand.endsWith('s') ? 60 : c.hand.endsWith('o') ? 35 : 80]));
};
