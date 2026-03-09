import { Card, RANKS, SUITS, cardToString } from '../entities/Card';

type HandRank = number[];

export interface EquityResult {
  wins: number;
  ties: number;
  losses: number;
  winRate: number;
  tieRate: number;
  lossRate: number;
}

const cardValue = (card: Card): number => RANKS.indexOf(card.rank) + 2;

const compareRank = (a: HandRank, b: HandRank): number => {
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
};

const evaluateFive = (cards: Card[]): HandRank => {
  const values = cards.map(cardValue).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);
  const isFlush = suits.every((s) => s === suits[0]);

  const counts = new Map<number, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  const groups = [...counts.entries()].sort((a, b) => (b[1] - a[1]) || (b[0] - a[0]));

  const unique = [...new Set(values)].sort((a, b) => b - a);
  let straight = false;
  let straightHigh = unique[0];
  if (unique.length === 5) {
    if (unique[0] - unique[4] === 4) straight = true;
    if (JSON.stringify(unique) === JSON.stringify([14, 5, 4, 3, 2])) {
      straight = true;
      straightHigh = 5;
    }
  }

  if (straight && isFlush) return [8, straightHigh];
  if (groups[0][1] === 4) return [7, groups[0][0], groups[1][0]];
  if (groups[0][1] === 3 && groups[1][1] === 2) return [6, groups[0][0], groups[1][0]];
  if (isFlush) return [5, ...values];
  if (straight) return [4, straightHigh];
  if (groups[0][1] === 3) {
    const kickers = groups.filter((g) => g[1] === 1).map((g) => g[0]).sort((a, b) => b - a);
    return [3, groups[0][0], ...kickers];
  }
  if (groups[0][1] === 2 && groups[1][1] === 2) {
    const pairs = groups.filter((g) => g[1] === 2).map((g) => g[0]).sort((a, b) => b - a);
    return [2, ...pairs, groups.find((g) => g[1] === 1)![0]];
  }
  if (groups[0][1] === 2) {
    return [1, groups[0][0], ...groups.filter((g) => g[1] === 1).map((g) => g[0]).sort((a, b) => b - a)];
  }
  return [0, ...values];
};

const combinations = <T,>(arr: T[], k: number): T[][] => {
  const output: T[][] = [];
  const recurse = (start: number, current: T[]): void => {
    if (current.length === k) {
      output.push([...current]);
      return;
    }
    for (let i = start; i < arr.length; i += 1) {
      current.push(arr[i]);
      recurse(i + 1, current);
      current.pop();
    }
  };
  recurse(0, []);
  return output;
};

const bestOfSeven = (cards: Card[]): HandRank => {
  const combos = combinations(cards, 5);
  return combos.reduce<HandRank>((best, combo) => {
    const rank = evaluateFive(combo);
    return compareRank(rank, best) > 0 ? rank : best;
  }, [0]);
};

const fullDeck = (): Card[] => RANKS.flatMap((rank) => SUITS.map((suit) => ({ rank, suit })));

const randomDraw = (deck: Card[], n: number): Card[] => {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
};

export class EquityCalculator {
  run(hero: Card[], board: Card[], opponents: number, iterations: number): EquityResult {
    const known = new Set([...hero, ...board].map(cardToString));
    const deck = fullDeck().filter((card) => !known.has(cardToString(card)));

    let wins = 0;
    let ties = 0;
    let losses = 0;

    for (let i = 0; i < iterations; i += 1) {
      const missingBoard = 5 - board.length;
      const needed = missingBoard + opponents * 2;
      const draw = randomDraw(deck, needed);
      const table = [...board, ...draw.slice(0, missingBoard)];

      const heroRank = bestOfSeven([...hero, ...table]);
      let result: -1 | 0 | 1 = 1;

      for (let p = 0; p < opponents; p += 1) {
        const enemy = draw.slice(missingBoard + p * 2, missingBoard + p * 2 + 2);
        const enemyRank = bestOfSeven([...enemy, ...table]);
        const cmp = compareRank(heroRank, enemyRank);
        if (cmp < 0) {
          result = -1;
          break;
        }
        if (cmp === 0) result = 0;
      }

      if (result === 1) wins += 1;
      if (result === 0) ties += 1;
      if (result === -1) losses += 1;
    }

    return {
      wins,
      ties,
      losses,
      winRate: Number(((wins / iterations) * 100).toFixed(2)),
      tieRate: Number(((ties / iterations) * 100).toFixed(2)),
      lossRate: Number(((losses / iterations) * 100).toFixed(2))
    };
  }
}
