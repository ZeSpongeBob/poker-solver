export type Street = 'preflop' | 'flop' | 'turn' | 'river';

export interface SizingInput {
  street: Street;
  stackBb: number;
  potBb: number;
  inPosition: boolean;
}

export interface SizingOutput {
  spr: number;
  sizes: {
    small: number;
    standard: number;
    big: number;
  };
  note: string;
}

export class SizingAdvisor {
  suggest(input: SizingInput): SizingOutput {
    const spr = input.stackBb / input.potBb;
    const posFactor = input.inPosition ? 1 : 0.9;

    const base = (() => {
      if (input.street === 'preflop') return 2.3;
      if (input.street === 'flop') return spr > 6 ? 0.33 : 0.5;
      if (input.street === 'turn') return spr > 3 ? 0.66 : 0.75;
      return spr > 1.5 ? 0.75 : 1;
    })();

    const small = Number((input.potBb * base * 0.8 * posFactor).toFixed(1));
    const standard = Number((input.potBb * base * posFactor).toFixed(1));
    const big = Number((input.potBb * base * 1.25 * posFactor).toFixed(1));

    const note = spr <= 1.2
      ? 'SPR très bas : stratégie de tapis fréquente.'
      : spr <= 2.2
        ? 'SPR moyen-bas : privilégie des gros sizings polarisés.'
        : 'SPR confortable : mélange entre petits sizings et overbets selon texture.';

    return { spr: Number(spr.toFixed(2)), sizes: { small, standard, big }, note };
  }
}
