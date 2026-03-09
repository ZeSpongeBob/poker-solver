import { FormEvent, useMemo, useState } from 'react';
import { parseCards } from './domain/entities/Card';
import { PokerCard } from './presentation/components/PokerCard';
import { usePokerSolver } from './presentation/hooks/usePokerSolver';
import { StreetPhase } from './domain/services/PostflopAdvisor';
import { TablePosition } from './domain/services/PreflopAdvisor';
import './presentation/styles/app.css';

type Page = 'dashboard' | 'preflop' | 'postflop' | 'solver' | 'tracker';
const pages: Page[] = ['dashboard', 'preflop', 'postflop', 'solver', 'tracker'];

const weightClass = (w: number): string => (w >= 100 ? 'w100' : w >= 75 ? 'w75' : w >= 50 ? 'w50' : w >= 25 ? 'w25' : 'w0');

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const {
    equity, sizing, error, hands, rangeCells, ipRange, oopRange, solveResult, preflopPlan, postflopPlan,
    computeEquity, computeSizing, computePreflopPlan, computePostflopPlan, solveSpot, updateRangeCell, addHand, clearHands
  } = usePokerSolver();

  const [hero, setHero] = useState('As Kd');
  const [board, setBoard] = useState('Ah 8h 2c');
  const [opponents, setOpponents] = useState(1);
  const [iterations, setIterations] = useState(6000);

  const [street, setStreet] = useState<'preflop' | 'flop' | 'turn' | 'river'>('flop');
  const [stackBb, setStackBb] = useState(80);
  const [potBb, setPotBb] = useState(8);
  const [position, setPosition] = useState<'ip' | 'oop'>('ip');

  const [pfPosition, setPfPosition] = useState<TablePosition>('co');
  const [playersLeft, setPlayersLeft] = useState(18);
  const [playersPaid, setPlayersPaid] = useState(15);
  const [remainingToAct, setRemainingToAct] = useState(3);
  const [openedBeforeYou, setOpenedBeforeYou] = useState(false);

  const [postStreet, setPostStreet] = useState<StreetPhase>('flop');
  const [texture, setTexture] = useState<'dry' | 'semi-wet' | 'wet'>('semi-wet');

  const [trackHand, setTrackHand] = useState('As Kd');
  const [trackStreet, setTrackStreet] = useState<'preflop' | 'flop' | 'turn' | 'river'>('flop');
  const [trackResult, setTrackResult] = useState<'win' | 'loss' | 'tie'>('win');
  const [trackBb, setTrackBb] = useState(0);

  const heroCards = useMemo(() => { try { return parseCards(hero); } catch { return []; } }, [hero]);
  const boardCards = useMemo(() => { try { return parseCards(board); } catch { return []; } }, [board]);
  const net = hands.reduce((sum, item) => sum + item.bb, 0);

  const onEquity = (e: FormEvent) => { e.preventDefault(); computeEquity(hero, board, opponents, iterations); };
  const onSizing = (e: FormEvent) => { e.preventDefault(); computeSizing(street, stackBb, potBb, position); };
  const onSolve = (e: FormEvent) => { e.preventDefault(); solveSpot(board, potBb, stackBb); };
  const onTrack = (e: FormEvent) => { e.preventDefault(); addHand({ hand: trackHand, street: trackStreet, result: trackResult, bb: trackBb }); };
  const onPreflop = (e: FormEvent) => { e.preventDefault(); computePreflopPlan({ position: pfPosition, effectiveStackBb: stackBb, playersLeft, playersPaid, remainingPlayersToAct: remainingToAct, openedBeforeYou }); };
  const onPostflop = (e: FormEvent) => { e.preventDefault(); computePostflopPlan({ street: postStreet, potBb, effectiveStackBb: stackBb, heroPosition: position, boardTexture: texture }); };

  return (
    <main className="layout">
      <h1>Poker Solver Pro</h1>
      <nav className="tabs">{pages.map((p) => <button key={p} type="button" className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>)}</nav>

      <section className="panel table-bg">
        <h2>Board Explorer</h2>
        <div className="cards-row">{heroCards.map((c, i) => <PokerCard card={c} key={`h-${i}`} />)}{boardCards.map((c, i) => <PokerCard card={c} key={`b-${i}`} />)}</div>
      </section>

      {page === 'dashboard' && <section className="panel"><h2>Dashboard rapide</h2><form className="grid" onSubmit={onEquity}><input value={hero} onChange={(e) => setHero(e.target.value)} /><input value={board} onChange={(e) => setBoard(e.target.value)} /><input type="number" value={opponents} onChange={(e) => setOpponents(Number(e.target.value))} /><input type="number" value={iterations} onChange={(e) => setIterations(Number(e.target.value))} /><button type="submit">Simuler équité</button></form><p>{equity}</p>{error && <p className="error">{error}</p>}</section>}

      {page === 'preflop' && (
        <section className="panel">
          <h2>Analyse Préflop Premium (stack/position/ICM)</h2>
          <form className="grid" onSubmit={onPreflop}>
            <select value={pfPosition} onChange={(e) => setPfPosition(e.target.value as TablePosition)}><option value="utg">UTG</option><option value="hj">HJ</option><option value="co">CO</option><option value="btn">BTN</option><option value="sb">SB</option><option value="bb">BB</option></select>
            <input type="number" value={stackBb} onChange={(e) => setStackBb(Number(e.target.value))} placeholder="Stack effectif bb" />
            <input type="number" value={playersLeft} onChange={(e) => setPlayersLeft(Number(e.target.value))} placeholder="Joueurs restants" />
            <input type="number" value={playersPaid} onChange={(e) => setPlayersPaid(Number(e.target.value))} placeholder="Places payées" />
            <input type="number" value={remainingToAct} onChange={(e) => setRemainingToAct(Number(e.target.value))} placeholder="Joueurs à parler" />
            <label className="check"><input type="checkbox" checked={openedBeforeYou} onChange={(e) => setOpenedBeforeYou(e.target.checked)} /> Open avant toi</label>
            <button type="submit">Générer plan préflop</button>
          </form>
          {preflopPlan && <div className="solver-output"><p><strong>Open conseillé:</strong> {preflopPlan.openSizeBb}bb • <strong>Bubble factor:</strong> {preflopPlan.bubbleFactor}</p><p>{preflopPlan.recommendation}</p><p><strong>Value:</strong> {preflopPlan.rangeProfile.value.join(', ')}</p><p><strong>Suited bluffs:</strong> {preflopPlan.rangeProfile.suitedBluffs.join(', ') || '—'}</p><p><strong>Offsuit bluffs:</strong> {preflopPlan.rangeProfile.offsuitBluffs.join(', ') || '—'}</p></div>}
        </section>
      )}

      {page === 'postflop' && (
        <section className="panel">
          <h2>Analyse Postflop Premium (Flop/Turn/River)</h2>
          <form className="grid" onSubmit={onPostflop}>
            <select value={postStreet} onChange={(e) => setPostStreet(e.target.value as StreetPhase)}><option value="flop">Flop</option><option value="turn">Turn</option><option value="river">River</option></select>
            <select value={texture} onChange={(e) => setTexture(e.target.value as 'dry' | 'semi-wet' | 'wet')}><option value="dry">Dry</option><option value="semi-wet">Semi-wet</option><option value="wet">Wet</option></select>
            <input type="number" value={potBb} onChange={(e) => setPotBb(Number(e.target.value))} placeholder="Pot bb" />
            <input type="number" value={stackBb} onChange={(e) => setStackBb(Number(e.target.value))} placeholder="Stack bb" />
            <select value={position} onChange={(e) => setPosition(e.target.value as 'ip' | 'oop')}><option value="ip">IP</option><option value="oop">OOP</option></select>
            <button type="submit">Générer plan postflop</button>
          </form>
          {postflopPlan && <div className="solver-output"><p><strong>SPR:</strong> {postflopPlan.spr} • <strong>C-bet freq:</strong> {postflopPlan.cbetFrequency}%</p><p><strong>Sizing small/std/big:</strong> {postflopPlan.sizePlan.join(' / ')} bb</p><p>{postflopPlan.note}</p></div>}
        </section>
      )}

      {page === 'solver' && (
        <section className="panel">
          <h2>Solveur de spot</h2>
          <form className="grid" onSubmit={onSolve}><input value={board} onChange={(e) => setBoard(e.target.value)} placeholder="Ah 8h 2c" /><input type="number" value={potBb} onChange={(e) => setPotBb(Number(e.target.value))} /><input type="number" value={stackBb} onChange={(e) => setStackBb(Number(e.target.value))} /><button type="submit">Lancer le solve</button></form>
          <div className="range-wrapper"><div><h3>Range IP</h3><div className="range-grid">{rangeCells.map((cell) => <button type="button" key={`ip-${cell.key}`} className={`cell ${weightClass(ipRange[cell.key] ?? 0)}`} onClick={() => updateRangeCell('ip', cell.key)}>{cell.hand}<small>{ipRange[cell.key] ?? 0}%</small></button>)}</div></div><div><h3>Range OOP</h3><div className="range-grid">{rangeCells.map((cell) => <button type="button" key={`oop-${cell.key}`} className={`cell ${weightClass(oopRange[cell.key] ?? 0)}`} onClick={() => updateRangeCell('oop', cell.key)}>{cell.hand}<small>{oopRange[cell.key] ?? 0}%</small></button>)}</div></div></div>
          {solveResult && <div className="solver-output"><p><strong>Check</strong> {solveResult.globalFrequencies.check}% • <strong>Bet33</strong> {solveResult.globalFrequencies.bet33}% • <strong>Bet75</strong> {solveResult.globalFrequencies.bet75}% • <strong>Jam</strong> {solveResult.globalFrequencies.jam}%</p><table><thead><tr><th>Combo</th><th>EV</th><th>Check</th><th>B33</th><th>B75</th><th>Jam</th></tr></thead><tbody>{solveResult.combos.slice(0, 12).map((c) => <tr key={c.hand}><td>{c.hand}</td><td>{c.ev}</td><td>{c.frequencies.check}%</td><td>{c.frequencies.bet33}%</td><td>{c.frequencies.bet75}%</td><td>{c.frequencies.jam}%</td></tr>)}</tbody></table></div>}
        </section>
      )}

      {page === 'tracker' && <section className="panel"><h2>Tracker</h2><form className="grid" onSubmit={onTrack}><input value={trackHand} onChange={(e) => setTrackHand(e.target.value)} /><select value={trackStreet} onChange={(e) => setTrackStreet(e.target.value as typeof trackStreet)}><option value="preflop">Préflop</option><option value="flop">Flop</option><option value="turn">Turn</option><option value="river">River</option></select><select value={trackResult} onChange={(e) => setTrackResult(e.target.value as typeof trackResult)}><option value="win">Win</option><option value="loss">Loss</option><option value="tie">Tie</option></select><input type="number" value={trackBb} onChange={(e) => setTrackBb(Number(e.target.value))} /><button type="submit">Ajouter</button></form><div className="stats">Mains: {hands.length} • Net: {net.toFixed(1)} bb</div><ul>{[...hands].reverse().map((hand) => (<li key={hand.id}>{hand.hand} · {hand.street} · {hand.result} · {hand.bb}bb</li>))}</ul><button className="danger" type="button" onClick={clearHands}>Vider</button></section>}

      <section className="panel"><h2>Sizing advisor rapide</h2><form className="grid" onSubmit={onSizing}><select value={street} onChange={(e) => setStreet(e.target.value as typeof street)}><option value="preflop">Préflop</option><option value="flop">Flop</option><option value="turn">Turn</option><option value="river">River</option></select><input type="number" value={stackBb} onChange={(e) => setStackBb(Number(e.target.value))} /><input type="number" value={potBb} onChange={(e) => setPotBb(Number(e.target.value))} /><select value={position} onChange={(e) => setPosition(e.target.value as 'ip' | 'oop')}><option value="ip">IP</option><option value="oop">OOP</option></select><button type="submit">Recommander</button></form><p>{sizing}</p></section>
    </main>
  );
}
