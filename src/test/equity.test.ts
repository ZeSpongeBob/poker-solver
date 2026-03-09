import { describe, expect, it } from 'vitest';
import { parseCards } from '../domain/entities/Card';
import { EquityCalculator } from '../domain/services/EquityCalculator';

describe('EquityCalculator', () => {
  it('returns valid percentages close to 100 total', () => {
    const calc = new EquityCalculator();
    const result = calc.run(parseCards('As Ad'), parseCards('7h 8h 2c'), 1, 1000);
    expect(result.winRate + result.tieRate + result.lossRate).toBeCloseTo(100, 0);
  });
});
