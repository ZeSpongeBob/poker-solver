import { parseCards, Rank, RANKS } from '../entities/Card';

export type SolverAction = 'check' | 'bet33' | 'bet75' | 'jam';

export interface SolverInput {
  boardText: string;
  potBb: number;
  stackBb: number;
  ipRange: Record<string, number>;
  oopRange: Record<string, number>;
}

export interface ComboStrategy {
  hand: string;
  weight: number;
  frequencies: Record<SolverAction, number>;
  ev: number;
}

export interface SolverOutput {
  globalFrequencies: Record<SolverAction, number>;
  combos: ComboStrategy[];
}

const strengthByRank = (rank: Rank): number => RANKS.indexOf(rank) + 2;

const parseHandStrength = (hand: string): number => {
  const chars = hand.replace(/[^2-9TJQKA]/g, '').split('') as Rank[];
  if (chars.length < 2) return 8;
  const [a, b] = chars;
  const pairBonus = a === b ? 8 : 0;
  return (strengthByRank(a) + strengthByRank(b)) / 2 + pairBonus;
};

const boardTexture = (boardText: string): number => {
  const board = parseCards(boardText);
  if (board.length < 3) return 1;
  const suits = new Set(board.map((c) => c.suit)).size;
  const ranks = board.map((c) => strengthByRank(c.rank)).sort((a, b) => a - b);
  const connected = ranks[ranks.length - 1] - ranks[0] <= 5 ? 1.1 : 0.95;
  const flushy = suits <= 2 ? 1.1 : 0.9;
  return connected * flushy;
};

const normalize = (v: number): number => Math.max(0, Math.min(100, Number(v.toFixed(1))));

export class GtoLikeSolver {
  solve(input: SolverInput): SolverOutput {
    const texture = boardTexture(input.boardText);
    const spr = input.stackBb / Math.max(input.potBb, 0.1);

    const combos: ComboStrategy[] = Object.entries(input.ipRange).map(([hand, weight]) => {
      const s = parseHandStrength(hand) * texture;
      const pressure = spr < 2 ? 1.2 : spr < 4 ? 1 : 0.85;

      const jam = normalize((s - 12) * 4 * pressure);
      const bet75 = normalize((s - 9) * 6 * pressure - jam * 0.35);
      const bet33 = normalize((14 - Math.abs(10 - s)) * 5 - jam * 0.2);
      const check = normalize(100 - jam - bet75 - bet33);

      const total = jam + bet75 + bet33 + check || 1;
      const frequencies = {
        jam: normalize((jam / total) * 100),
        bet75: normalize((bet75 / total) * 100),
        bet33: normalize((bet33 / total) * 100),
        check: normalize((check / total) * 100)
      };

      const ev = Number((((frequencies.bet75 + frequencies.jam * 1.3) / 100) * input.potBb - (100 - weight) * 0.01).toFixed(2));
      return { hand, weight, frequencies, ev };
    });

    const weighted = (action: SolverAction): number => {
      const totalW = combos.reduce((acc, c) => acc + c.weight, 0) || 1;
      return Number((combos.reduce((acc, c) => acc + c.weight * c.frequencies[action], 0) / totalW).toFixed(1));
    };

    return {
      globalFrequencies: {
        check: weighted('check'),
        bet33: weighted('bet33'),
        bet75: weighted('bet75'),
        jam: weighted('jam')
      },
      combos: combos.sort((a, b) => b.ev - a.ev).slice(0, 40)
    };
  }
}
