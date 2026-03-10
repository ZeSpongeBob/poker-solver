import { describe, expect, it } from 'vitest';
import { GtoLikeSolver } from '../domain/services/GtoLikeSolver';

describe('GtoLikeSolver', () => {
  it('returns global frequencies and combo outputs', () => {
    const solver = new GtoLikeSolver();
    const range = { AA: 100, AKs: 75, AKo: 50, QJo: 25 };
    const out = solver.solve({ boardText: 'Ah 8h 2c', potBb: 10, stackBb: 35, ipRange: range, oopRange: range });
    expect(out.combos.length).toBeGreaterThan(0);
    expect(out.globalFrequencies.bet33 + out.globalFrequencies.bet75 + out.globalFrequencies.jam + out.globalFrequencies.check).toBeGreaterThan(95);
  });
});
