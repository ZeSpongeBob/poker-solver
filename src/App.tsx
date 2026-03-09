import { FormEvent, useMemo, useState } from 'react';
import { parseCards } from './domain/entities/Card';
import { PokerCard } from './presentation/components/PokerCard';
import { usePokerSolver } from './presentation/hooks/usePokerSolver';
import './presentation/styles/app.css';

const weightClass = (w: number): string => {
  if (w >= 100) return 'w100';
  if (w >= 75) return 'w75';
  if (w >= 50) return 'w50';
  if (w >= 25) return 'w25';
  return 'w0';
};

export default function App() {
  const {
    equity, sizing, error, hands,
    rangeCells, ipRange, oopRange, solveResult,
    computeEquity, computeSizing, solveSpot, updateRangeCell,
    addHand, clearHands
  } = usePokerSolver();

  const [hero, setHero] = useState('As Kd');
  const [board, setBoard] = useState('Ah 8h 2c');
  const [opponents, setOpponents] = useState(1);
  const [iterations, setIterations] = useState(6000);

  const [street, setStreet] = useState<'preflop' | 'flop' | 'turn' | 'river'>('flop');
  const [stackBb, setStackBb] = useState(80);
  const [potBb, setPotBb] = useState(8);
  const [position, setPosition] = useState<'ip' | 'oop'>('ip');

  const [trackHand, setTrackHand] = useState('As Kd');
  const [trackStreet, setTrackStreet] = useState<'preflop' | 'flop' | 'turn' | 'river'>('flop');
  const [trackResult, setTrackResult] = useState<'win' | 'loss' | 'tie'>('win');
  const [trackBb, setTrackBb] = useState(0);

  const heroCards = useMemo(() => { try { return parseCards(hero); } catch { return []; } }, [hero]);
  const boardCards = useMemo(() => { try { return parseCards(board); } catch { return []; } }, [board]);
  const net = hands.reduce((sum, item) => sum + item.bb, 0);

  const onEquity = (event: FormEvent) => { event.preventDefault(); computeEquity(hero, board, opponents, iterations); };
  const onSizing = (event: FormEvent) => { event.preventDefault(); computeSizing(street, stackBb, potBb, position); };
  const onTrack = (event: FormEvent) => { event.preventDefault(); addHand({ hand: trackHand, street: trackStreet, result: trackResult, bb: trackBb }); };
  const onSolve = (event: FormEvent) => { event.preventDefault(); solveSpot(board, potBb, stackBb); };

  return (
    <main className="layout">
      <h1>Poker Solver Lab — style GTO+ (lite)</h1>

      <section className="panel table-bg">
        <h2>Board explorer visuel</h2>
        <div className="cards-row">{heroCards.map((c, i) => <PokerCard card={c} key={`h-${i}`} />)}{boardCards.map((c, i) => <PokerCard card={c} key={`b-${i}`} />)}</div>
      </section>

      <section className="panel">
        <h2>Solveur de spot (inspiré GTO+)</h2>
        <form className="grid" onSubmit={onSolve}>
          <input value={board} onChange={(e) => setBoard(e.target.value)} placeholder="Ah 8h 2c" />
          <input type="number" value={potBb} onChange={(e) => setPotBb(Number(e.target.value))} placeholder="Pot bb" />
          <input type="number" value={stackBb} onChange={(e) => setStackBb(Number(e.target.value))} placeholder="Stack bb" />
          <button type="submit">Lancer le solve</button>
        </form>

        <div className="range-wrapper">
          <div>
            <h3>Range IP (clic pour cycler 0/25/50/75/100)</h3>
            <div className="range-grid">{rangeCells.map((cell) => <button type="button" key={`ip-${cell.key}`} className={`cell ${weightClass(ipRange[cell.key] ?? 0)}`} onClick={() => updateRangeCell('ip', cell.key)}>{cell.hand}<small>{ipRange[cell.key] ?? 0}%</small></button>)}</div>
          </div>
          <div>
            <h3>Range OOP</h3>
            <div className="range-grid">{rangeCells.map((cell) => <button type="button" key={`oop-${cell.key}`} className={`cell ${weightClass(oopRange[cell.key] ?? 0)}`} onClick={() => updateRangeCell('oop', cell.key)}>{cell.hand}<small>{oopRange[cell.key] ?? 0}%</small></button>)}</div>
          </div>
        </div>

        {solveResult && (
          <div className="solver-output">
            <p><strong>Fréquences globales:</strong> Check {solveResult.globalFrequencies.check}% • Bet 33% {solveResult.globalFrequencies.bet33}% • Bet 75% {solveResult.globalFrequencies.bet75}% • Jam {solveResult.globalFrequencies.jam}%</p>
            <table>
              <thead><tr><th>Combo</th><th>EV</th><th>Check</th><th>B33</th><th>B75</th><th>Jam</th></tr></thead>
              <tbody>{solveResult.combos.slice(0, 12).map((c) => <tr key={c.hand}><td>{c.hand}</td><td>{c.ev}</td><td>{c.frequencies.check}%</td><td>{c.frequencies.bet33}%</td><td>{c.frequencies.bet75}%</td><td>{c.frequencies.jam}%</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel"><h2>Équité interactive</h2><form className="grid" onSubmit={onEquity}><input value={hero} onChange={(e) => setHero(e.target.value)} placeholder="As Kd" /><input value={board} onChange={(e) => setBoard(e.target.value)} placeholder="7h 8h 2c" /><input type="number" value={opponents} min={1} max={8} onChange={(e) => setOpponents(Number(e.target.value))} /><input type="number" value={iterations} min={500} max={50000} onChange={(e) => setIterations(Number(e.target.value))} /><button type="submit">Simuler</button></form><p>{equity}</p>{error && <p className="error">{error}</p>}</section>

      <section className="panel"><h2>Sizing advisor</h2><form className="grid" onSubmit={onSizing}><select value={street} onChange={(e) => setStreet(e.target.value as typeof street)}><option value="preflop">Préflop</option><option value="flop">Flop</option><option value="turn">Turn</option><option value="river">River</option></select><input type="number" value={stackBb} onChange={(e) => setStackBb(Number(e.target.value))} /><input type="number" value={potBb} onChange={(e) => setPotBb(Number(e.target.value))} /><select value={position} onChange={(e) => setPosition(e.target.value as 'ip' | 'oop')}><option value="ip">IP</option><option value="oop">OOP</option></select><button type="submit">Recommander</button></form><p>{sizing}</p></section>

      <section className="panel"><h2>Tracker</h2><form className="grid" onSubmit={onTrack}><input value={trackHand} onChange={(e) => setTrackHand(e.target.value)} /><select value={trackStreet} onChange={(e) => setTrackStreet(e.target.value as typeof trackStreet)}><option value="preflop">Préflop</option><option value="flop">Flop</option><option value="turn">Turn</option><option value="river">River</option></select><select value={trackResult} onChange={(e) => setTrackResult(e.target.value as typeof trackResult)}><option value="win">Win</option><option value="loss">Loss</option><option value="tie">Tie</option></select><input type="number" value={trackBb} onChange={(e) => setTrackBb(Number(e.target.value))} /><button type="submit">Ajouter</button></form><div className="stats">Mains: {hands.length} • Net: {net.toFixed(1)} bb</div><ul>{[...hands].reverse().map((hand) => (<li key={hand.id}>{hand.hand} · {hand.street} · {hand.result} · {hand.bb}bb</li>))}</ul><button className="danger" type="button" onClick={clearHands}>Vider</button></section>
    </main>
  );
}
