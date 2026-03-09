import { Card } from '../../domain/entities/Card';

const suitMeta = {
  s: { symbol: '♠', color: 'black' },
  c: { symbol: '♣', color: 'black' },
  h: { symbol: '♥', color: 'red' },
  d: { symbol: '♦', color: 'red' }
} as const;

export function PokerCard({ card }: { card: Card }) {
  const suit = suitMeta[card.suit];
  return (
    <div className={`poker-card ${suit.color}`}>
      <span>{card.rank}</span>
      <span>{suit.symbol}</span>
    </div>
  );
}
