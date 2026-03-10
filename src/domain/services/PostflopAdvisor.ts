export type StreetPhase = 'flop' | 'turn' | 'river';

export interface PostflopInput {
  street: StreetPhase;
  potBb: number;
  effectiveStackBb: number;
  heroPosition: 'ip' | 'oop';
  boardTexture: 'dry' | 'semi-wet' | 'wet';
}

export interface PostflopOutput {
  spr: number;
  cbetFrequency: number;
  sizePlan: number[];
  note: string;
}

export class PostflopAdvisor {
  advise(input: PostflopInput): PostflopOutput {
    const spr = Number((input.effectiveStackBb / Math.max(input.potBb, 0.1)).toFixed(2));
    const ipBoost = input.heroPosition === 'ip' ? 1.1 : 0.9;
    const textureFactor = input.boardTexture === 'dry' ? 1.15 : input.boardTexture === 'semi-wet' ? 1 : 0.82;

    const base = input.street === 'flop' ? 52 : input.street === 'turn' ? 44 : 36;
    const cbetFrequency = Math.max(15, Math.min(85, Math.round(base * ipBoost * textureFactor)));

    const mainSize = input.street === 'flop'
      ? (input.boardTexture === 'dry' ? 0.33 : 0.55)
      : input.street === 'turn'
        ? (spr > 2.5 ? 0.66 : 0.8)
        : (spr > 1.4 ? 0.75 : 1);

    const sizePlan = [0.75, 1, 1.25].map((f) => Number((input.potBb * mainSize * f).toFixed(1)));
    const note = spr <= 1.2
      ? 'SPR faible: préparer des lignes shove/check-jam très fréquentes.'
      : input.boardTexture === 'wet'
        ? 'Board connecté: augmenter la densité de gros sizings orientés value/protection.'
        : 'Board favorable: mixer petits sizings de pression et checks de contrôle.';

    return { spr, cbetFrequency, sizePlan, note };
  }
}
