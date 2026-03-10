import { describe, expect, it } from 'vitest';
import { PostflopAdvisor } from '../domain/services/PostflopAdvisor';

describe('PostflopAdvisor', () => {
  it('returns coherent spr and sizing plan', () => {
    const advisor = new PostflopAdvisor();
    const out = advisor.advise({ street: 'turn', potBb: 12, effectiveStackBb: 30, heroPosition: 'ip', boardTexture: 'wet' });
    expect(out.spr).toBe(2.5);
    expect(out.sizePlan[1]).toBeGreaterThan(0);
    expect(out.cbetFrequency).toBeGreaterThan(10);
  });
});
