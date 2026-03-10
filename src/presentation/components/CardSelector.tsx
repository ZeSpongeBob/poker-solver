import { Card, RANKS, SUITS, cardToString, parseCard } from '../../domain/entities/Card';

const suitChar: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };

interface Props {
  selectedHero: Card[];
  selectedBoard: Card[];
  target: 'hero' | 'board';
  maxBoardCards: number;
  onTargetChange: (target: 'hero' | 'board') => void;
  onToggle: (card: Card) => void;
}

export function CardSelector({ selectedHero, selectedBoard, target, maxBoardCards, onTargetChange, onToggle }: Props) {
  const deck = [...RANKS].reverse().flatMap((r) => SUITS.map((s) => parseCard(`${r}${s}`)));
  const selected = new Set([...selectedHero, ...selectedBoard].map(cardToString));

  return (
    <div>
      <div className="picker-head">
        <button type="button" className={target === 'hero' ? 'active' : ''} onClick={() => onTargetChange('hero')}>
          Hero ({selectedHero.length}/2)
        </button>
        <button type="button" className={target === 'board' ? 'active' : ''} onClick={() => onTargetChange('board')}>
          Board ({selectedBoard.length}/{maxBoardCards})
        </button>
      </div>
      <div className="card-palette">
        {deck.map((card) => {
          const id = cardToString(card);
          const on = selected.has(id);
          return (
            <button key={id} type="button" className={`mini-card ${on ? 'on' : ''} ${card.suit === 'h' || card.suit === 'd' ? 'red' : ''}`} onClick={() => onToggle(card)}>
              {card.rank}{suitChar[card.suit]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
