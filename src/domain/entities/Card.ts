export type Suit = 's' | 'h' | 'd' | 'c';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const SUITS: Suit[] = ['s', 'h', 'd', 'c'];

export const parseCard = (token: string): Card => {
  const normalized = token.trim();
  if (normalized.length !== 2) throw new Error(`Carte invalide: ${token}`);
  const rank = normalized[0].toUpperCase() as Rank;
  const suit = normalized[1].toLowerCase() as Suit;
  if (!RANKS.includes(rank) || !SUITS.includes(suit)) throw new Error(`Carte invalide: ${token}`);
  return { rank, suit };
};

export const cardToString = (card: Card): string => `${card.rank}${card.suit}`;

export const parseCards = (value: string): Card[] => {
  if (!value.trim()) return [];
  const cards = value.split(/\s+/).map(parseCard);
  const unique = new Set(cards.map(cardToString));
  if (unique.size !== cards.length) throw new Error('Cartes dupliquées dans la saisie.');
  return cards;
};
