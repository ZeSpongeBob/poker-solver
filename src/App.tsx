import { FormEvent, useMemo, useState } from 'react';
import { parseCards } from './domain/entities/Card';
import { PokerCard } from './presentation/components/PokerCard';
import { usePokerSolver } from './presentation/hooks/usePokerSolver';
import './presentation/styles/app.css';

export default function App() {
  const { equity, sizing, error, hands, computeEquity, computeSizing, addHand, clearHands } = usePokerSolver();

  const [hero, setHero] = useState('As Kd');
  const [board, setBoard] = useState('');
  const [opponents, setOpponents] = useState(1);
  const [iterations, setIterations] = useState(5000);

  const [street, setStreet] = useState<'preflop' | 'flop' | 'turn' | 'river'>('flop');
  const [stackBb, setStackBb] = useState(80);
  const [potBb, setPotBb] = useState(8);
  const [position, setPosition] = useState<'ip' | 'oop'>('ip');

  const [trackHand, setTrackHand] = useState('As Kd');
  const [trackStreet, setTrackStreet] = useState<'preflop' | 'flop' | 'turn' | 'river'>('flop');
  const [trackResult, setTrackResult] = useState<'win' | 'loss' | 'tie'>('win');
  const [trackBb, setTrackBb] = useState(0);

  const heroCards = useMemo(() => {
    try {
      return parseCards(hero);
    } catch {
      return [];
    }
  }, [hero]);

  const boardCards = useMemo(() => {
    try {
      return parseCards(board);
    } catch {
      return [];
    }
  }, [board]);

  const onEquity = (event: FormEvent) => {
    event.preventDefault();
    computeEquity(hero, board, opponents, iterations);
  };

  const onSizing = (event: FormEvent) => {
    event.preventDefault();
    computeSizing(street, stackBb, potBb, position);
  };

  const onTrack = (event: FormEvent) => {
    event.preventDefault();
    addHand({ hand: trackHand, street: trackStreet, result: trackResult, bb: trackBb });
  };

  const net = hands.reduce((sum, item) => sum + item.bb, 0);

  return (
    <main className="layout">
      <h1>Poker Solver • React + TypeScript</h1>

      <section className="panel table-bg">
        <h2>Vision des cartes en direct</h2>
        <div className="cards-row">
          {heroCards.map((card, idx) => <PokerCard card={card} key={`hero-${idx}`} />)}
          {boardCards.map((card, idx) => <PokerCard card={card} key={`board-${idx}`} />)}
        </div>
      </section>

      <section className="panel">
        <h2>Équité interactive</h2>
        <form className="grid" onSubmit={onEquity}>
          <input value={hero} onChange={(e) => setHero(e.target.value)} placeholder="As Kd" />
          <input value={board} onChange={(e) => setBoard(e.target.value)} placeholder="7h 8h 2c" />
          <input type="number" value={opponents} min={1} max={8} onChange={(e) => setOpponents(Number(e.target.value))} />
          <input type="number" value={iterations} min={500} max={50000} onChange={(e) => setIterations(Number(e.target.value))} />
          <button type="submit">Simuler</button>
        </form>
        <p>{equity}</p>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="panel">
        <h2>Sizing advisor</h2>
        <form className="grid" onSubmit={onSizing}>
          <select value={street} onChange={(e) => setStreet(e.target.value as typeof street)}>
            <option value="preflop">Préflop</option><option value="flop">Flop</option><option value="turn">Turn</option><option value="river">River</option>
          </select>
          <input type="number" value={stackBb} onChange={(e) => setStackBb(Number(e.target.value))} />
          <input type="number" value={potBb} onChange={(e) => setPotBb(Number(e.target.value))} />
          <select value={position} onChange={(e) => setPosition(e.target.value as 'ip' | 'oop')}>
            <option value="ip">IP</option><option value="oop">OOP</option>
          </select>
          <button type="submit">Recommander</button>
        </form>
        <p>{sizing}</p>
      </section>

      <section className="panel">
        <h2>Tracker</h2>
        <form className="grid" onSubmit={onTrack}>
          <input value={trackHand} onChange={(e) => setTrackHand(e.target.value)} />
          <select value={trackStreet} onChange={(e) => setTrackStreet(e.target.value as typeof trackStreet)}>
            <option value="preflop">Préflop</option><option value="flop">Flop</option><option value="turn">Turn</option><option value="river">River</option>
          </select>
          <select value={trackResult} onChange={(e) => setTrackResult(e.target.value as typeof trackResult)}>
            <option value="win">Win</option><option value="loss">Loss</option><option value="tie">Tie</option>
          </select>
          <input type="number" value={trackBb} onChange={(e) => setTrackBb(Number(e.target.value))} />
          <button type="submit">Ajouter</button>
        </form>

        <div className="stats">Mains: {hands.length} • Net: {net.toFixed(1)} bb</div>
        <ul>
          {[...hands].reverse().map((hand) => (
            <li key={hand.id}>{hand.hand} · {hand.street} · {hand.result} · {hand.bb}bb</li>
          ))}
        </ul>
        <button className="danger" type="button" onClick={clearHands}>Vider</button>
      </section>
    </main>
  );
}
