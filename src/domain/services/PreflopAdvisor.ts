export type TablePosition = 'utg' | 'hj' | 'co' | 'btn' | 'sb' | 'bb';

export interface PreflopInput {
  position: TablePosition;
  effectiveStackBb: number;
  playersLeft: number;
  playersPaid: number;
  remainingPlayersToAct: number;
  openedBeforeYou: boolean;
}

export interface PreflopOutput {
  bubbleFactor: number;
  openSizeBb: number;
  recommendation: string;
  rangeProfile: {
    value: string[];
    suitedBluffs: string[];
    offsuitBluffs: string[];
  };
}

const baseRanges: Record<TablePosition, { value: string[]; suitedBluffs: string[]; offsuitBluffs: string[] }> = {
  utg: { value: ['AA-99', 'AKs', 'AQs', 'AKo'], suitedBluffs: ['A5s-A4s', 'KQs'], offsuitBluffs: ['AQo'] },
  hj: { value: ['AA-88', 'AKs-AJs', 'AQo+'], suitedBluffs: ['A5s-A2s', 'KJs+'], offsuitBluffs: ['KQo'] },
  co: { value: ['AA-77', 'ATs+', 'AJo+'], suitedBluffs: ['A5s-A2s', 'KTs+', 'QTs+'], offsuitBluffs: ['KJo+', 'QJo'] },
  btn: { value: ['AA-66', 'A9s+', 'ATo+'], suitedBluffs: ['Any Axs', 'K8s+', 'Q8s+', 'J8s+'], offsuitBluffs: ['KTo+', 'QTo+', 'JTo'] },
  sb: { value: ['AA-77', 'ATs+', 'AJo+'], suitedBluffs: ['A2s+', 'K9s+', 'Q9s+'], offsuitBluffs: ['KTo+', 'QTo+'] },
  bb: { value: ['vs open: TT+', 'AQs+', 'AKo'], suitedBluffs: ['vs late: A2s-A5s'], offsuitBluffs: ['vs late: KQo'] }
};

export class PreflopAdvisor {
  advise(input: PreflopInput): PreflopOutput {
    const paidThreshold = Math.max(input.playersPaid, 1);
    const nearBubble = input.playersLeft <= paidThreshold + 3;
    const bubbleFactor = nearBubble ? Number((1.35 + (paidThreshold / input.playersLeft)).toFixed(2)) : 1;

    const stdOpen = input.effectiveStackBb < 20 ? 2 : input.position === 'btn' ? 2.2 : 2.3;
    const openSizeBb = Number((stdOpen + (nearBubble ? -0.1 : 0)).toFixed(1));

    const pressure = input.remainingPlayersToAct >= 4 ? 'haute' : 'modérée';
    const exploit = input.openedBeforeYou
      ? 'Privilégie une stratégie 3-bet/fold orientée value et bloqueurs.'
      : 'Priorise une stratégie d’open disciplinée selon la position et le stack effectif.';

    const recommendation =
      `Pression ICM ${nearBubble ? 'élevée' : 'standard'} (BF ${bubbleFactor}), pression de joueurs restants ${pressure}. ` +
      `${exploit}`;

    const profile = baseRanges[input.position];
    if (nearBubble) {
      return {
        bubbleFactor,
        openSizeBb,
        recommendation,
        rangeProfile: {
          value: profile.value,
          suitedBluffs: profile.suitedBluffs.slice(0, Math.max(1, profile.suitedBluffs.length - 1)),
          offsuitBluffs: []
        }
      };
    }

    return { bubbleFactor, openSizeBb, recommendation, rangeProfile: profile };
  }
}
