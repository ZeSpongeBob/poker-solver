import { describe, expect, it } from 'vitest';
import { SizingAdvisor } from '../domain/services/SizingAdvisor';

describe('SizingAdvisor', () => {
  it('computes positive sizes and spr', () => {
    const advisor = new SizingAdvisor();
    const out = advisor.suggest({ street: 'turn', stackBb: 36, potBb: 12, inPosition: true });
    expect(out.spr).toBe(3);
    expect(out.sizes.standard).toBeGreaterThan(0);
  });
});
