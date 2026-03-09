import { describe, expect, it } from 'vitest';
import { PreflopAdvisor } from '../domain/services/PreflopAdvisor';

describe('PreflopAdvisor', () => {
  it('tightens ranges near bubble', () => {
    const advisor = new PreflopAdvisor();
    const out = advisor.advise({
      position: 'co',
      effectiveStackBb: 24,
      playersLeft: 17,
      playersPaid: 15,
      remainingPlayersToAct: 3,
      openedBeforeYou: false
    });
    expect(out.bubbleFactor).toBeGreaterThan(1);
    expect(out.rangeProfile.offsuitBluffs).toHaveLength(0);
  });
});
