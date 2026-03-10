import { describe, expect, it } from 'vitest';
import { createRangeGrid, defaultRangeWeights } from '../domain/services/RangeMatrix';

describe('RangeMatrix', () => {
  it('creates 13x13 combos', () => {
    const grid = createRangeGrid();
    expect(grid).toHaveLength(169);
    expect(grid[0].hand).toBe('AA');
  });

  it('provides default weights', () => {
    const weights = defaultRangeWeights();
    expect(Object.keys(weights)).toHaveLength(169);
  });
});
