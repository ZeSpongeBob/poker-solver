import { FormEvent, useMemo, useState } from 'react';
import { Card, cardToString, parseCards } from './domain/entities/Card';
import { StreetPhase } from './domain/services/PostflopAdvisor';
import { TablePosition } from './domain/services/PreflopAdvisor';
import { ActionGauge } from './presentation/components/ActionGauge';
import { CardSelector } from './presentation/components/CardSelector';
import { PokerCard } from './presentation/components/PokerCard';
import { usePokerSolver } from './presentation/hooks/usePokerSolver';
import './presentation/styles/app.css';

type Page = 'dashboard' | 'preflop' | 'postflop' | 'solver' | 'tracker';
const pages: Page[] = ['dashboard', 'preflop', 'postflop', 'solver', 'tracker'];

const weightClass = (w: number): string => (w >= 100 ? 'w100' : w >= 75 ? 'w75' : w >= 50 ? 'w50' : w >= 25 ? 'w25' : 'w0');

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [target, setTarget] = useState<'hero' | 'board'>('hero');
  const {
    equity, sizing, error, hands, rangeCells, ipRange, oopRange, solveResult, preflopPlan, postflopPlan,
    computeEquity, computeSizing, computePreflopPlan, computePostflopPlan, solveSpot, updateRangeCell, addHand, clearHands
  } = usePokerSolver();

  const [selectedHero, setSelectedHero] = useState<Card[]>(parseCards('As Kd'));
  const [selectedBoard, setSelectedBoard] = useState<Card[]>([]);
  const [boardStage, setBoardStage] = useState<'preflop' | 'flop' | 'turn' | 'river'>('preflop');
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

  const heroText = useMemo(() => selectedHero.map(cardToString).join(' '), [selectedHero]);
  const boardText = useMemo(() => selectedBoard.map(cardToString).join(' '), [selectedBoard]);
  const net = hands.reduce((sum, item) => sum + item.bb, 0);
  const maxBoardCards = boardStage === 'preflop' ? 0 : boardStage === 'flop' ? 3 : boardStage === 'turn' ? 4 : 5;

  const toggleCard = (card: Card) => {
    const id = cardToString(card);
    const inHero = selectedHero.some((c) => cardToString(c) === id);
    const inBoard = selectedBoard.some((c) => cardToString(c) === id);
    if (inHero) return setSelectedHero((prev) => prev.filter((c) => cardToString(c) !== id));
    if (inBoard) return setSelectedBoard((prev) => prev.filter((c) => cardToString(c) !== id));
    if (target === 'hero') return selectedHero.length < 2 ? setSelectedHero((prev) => [...prev, card]) : undefined;
    return selectedBoard.length < maxBoardCards ? setSelectedBoard((prev) => [...prev, card]) : undefined;
  };

  const onEquity = (e: FormEvent) => { e.preventDefault(); computeEquity(heroText, boardText, opponents, iterations); };
  const onSizing = (e: FormEvent) => { e.preventDefault(); computeSizing(street, stackBb, potBb, position); };
  const onSolve = (e: FormEvent) => { e.preventDefault(); solveSpot(boardText, potBb, stackBb); };
  const onTrack = (e: FormEvent) => { e.preventDefault(); addHand({ hand: trackHand, street: trackStreet, result: trackResult, bb: trackBb }); };
  const onPreflop = (e: FormEvent) => { e.preventDefault(); computePreflopPlan({ position: pfPosition, effectiveStackBb: stackBb, playersLeft, playersPaid, remainingPlayersToAct: remainingToAct, openedBeforeYou }); };
  const onPostflop = (e: FormEvent) => { e.preventDefault(); computePostflopPlan({ street: postStreet, potBb, effectiveStackBb: stackBb, heroPosition: position, boardTexture: texture }); };

  const preGauge = preflopPlan ? { bet: Math.round(35 / preflopPlan.bubbleFactor), check: Math.round(15 * preflopPlan.bubbleFactor), raise: Math.round(30 / preflopPlan.bubbleFactor), fold: Math.round(20 * preflopPlan.bubbleFactor) } : { bet: 0, check: 0, raise: 0, fold: 0 };
  const postGauge = postflopPlan ? { bet: Math.min(95, Math.round(postflopPlan.cbetFrequency)), check: Math.max(5, 100 - Math.round(postflopPlan.cbetFrequency)), raise: Math.round(postflopPlan.cbetFrequency * 0.35), fold: Math.round((100 - postflopPlan.cbetFrequency) * 0.45) } : { bet: 0, check: 0, raise: 0, fold: 0 };

  return (
    <main className="layout">
      <h1>Poker Solver Pro — Texas Hold'em</h1>
      <p className="helper">👋 Nouveau ? Commence par l’étape 1 ci-dessous. En 30 secondes tu as une première recommandation.</p>
      <div className="quickstart">
        <div><strong>1)</strong> Texas Hold'em = 2 cartes Hero seulement + board progressif.</div>
        <div><strong>2)</strong> Va dans Dashboard et clique “Simuler équité”.</div>
        <div><strong>3)</strong> Va dans Préflop/Postflop pour les conseils d’actions.</div>
      </div>

      <nav className="tabs">{pages.map((p) => <button key={p} type="button" className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>)}</nav>

      <section className="panel">
        <h2>Format de coup (Hold'em)</h2>
        <div className="tabs">
          {(['preflop', 'flop', 'turn', 'river'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={boardStage === s ? 'active' : ''}
              onClick={() => {
                setBoardStage(s);
                const limit = s === 'preflop' ? 0 : s === 'flop' ? 3 : s === 'turn' ? 4 : 5;
                setSelectedBoard((prev) => prev.slice(0, limit));
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="helper">Au départ (préflop) le board doit être vide. Flop = 3 cartes, Turn = 4, River = 5.</p>
      </section>

      <section className="panel table-bg">
        <h2>Étape 1 — Sélection des cartes (Hold'em)</h2>
        <CardSelector selectedHero={selectedHero} selectedBoard={selectedBoard} target={target} maxBoardCards={maxBoardCards} onTargetChange={setTarget} onToggle={toggleCard} />
        <p className="helper">Hero: {heroText || '—'} • Board: {boardText || '—'}</p>
        <div className="cards-row">{selectedHero.map((c, i) => <PokerCard card={c} key={`h-${i}`} />)}{selectedBoard.map((c, i) => <PokerCard card={c} key={`b-${i}`} />)}</div>
      </section>

      {page === 'dashboard' && (
        <section className="panel">
          <h2>Étape 2 — Équité instantanée</h2>
          <form className="grid" onSubmit={onEquity}>
            <input value={heroText} readOnly aria-label="hero" />
            <input value={boardText} readOnly aria-label="board" />
            <input type="number" value={opponents} onChange={(e) => setOpponents(Number(e.target.value))} placeholder="Nb adversaires" />
            <input type="number" value={iterations} onChange={(e) => setIterations(Number(e.target.value))} placeholder="Itérations" />
            <button type="submit">Simuler équité</button>
          </form>
          <p>{equity}</p>
          {error && <p className="error">{error}</p>}
        </section>
      )}

      {page === 'preflop' && (
        <section className="panel">
          <h2>Étape 3A — Plan Préflop</h2>
          <form className="grid" onSubmit={onPreflop}>
            <select value={pfPosition} onChange={(e) => setPfPosition(e.target.value as TablePosition)}><option value="utg">UTG</option><option value="hj">HJ</option><option value="co">CO</option><option value="btn">BTN</option><option value="sb">SB</option><option value="bb">BB</option></select>
            <input type="number" value={stackBb} onChange={(e) => setStackBb(Number(e.target.value))} placeholder="Stack BB" />
            <input type="number" value={playersLeft} onChange={(e) => setPlayersLeft(Number(e.target.value))} placeholder="Joueurs restants" />
            <input type="number" value={playersPaid} onChange={(e) => setPlayersPaid(Number(e.target.value))} placeholder="Places payées" />
            <input type="number" value={remainingToAct} onChange={(e) => setRemainingToAct(Number(e.target.value))} placeholder="Joueurs à parler" />
            <label className="check"><input type="checkbox" checked={openedBeforeYou} onChange={(e) => setOpenedBeforeYou(e.target.checked)} /> Open avant toi</label>
            <button type="submit">Voir le plan préflop</button>
          </form>
          {preflopPlan && <div className="solver-output"><p><strong>Open:</strong> {preflopPlan.openSizeBb}bb • <strong>Bubble factor:</strong> {preflopPlan.bubbleFactor}</p><p>{preflopPlan.recommendation}</p></div>}
          <ActionGauge title="Répartition suggérée" values={preGauge} />
        </section>
      )}

      {page === 'postflop' && (
        <section className="panel">
          <h2>Étape 3B — Plan Postflop</h2>
          <form className="grid" onSubmit={onPostflop}>
            <select value={postStreet} onChange={(e) => setPostStreet(e.target.value as StreetPhase)}><option value="flop">Flop</option><option value="turn">Turn</option><option value="river">River</option></select>
            <select value={texture} onChange={(e) => setTexture(e.target.value as 'dry' | 'semi-wet' | 'wet')}><option value="dry">Board dry</option><option value="semi-wet">Board semi-wet</option><option value="wet">Board wet</option></select>
            <input type="number" value={potBb} onChange={(e) => setPotBb(Number(e.target.value))} placeholder="Pot (bb)" />
            <input type="number" value={stackBb} onChange={(e) => setStackBb(Number(e.target.value))} placeholder="Stack (bb)" />
            <select value={position} onChange={(e) => setPosition(e.target.value as 'ip' | 'oop')}><option value="ip">In Position</option><option value="oop">Out of Position</option></select>
            <button type="submit">Voir le plan postflop</button>
          </form>
          {postflopPlan && <div className="solver-output"><p><strong>SPR:</strong> {postflopPlan.spr} • <strong>C-bet:</strong> {postflopPlan.cbetFrequency}%</p><p><strong>Sizings:</strong> {postflopPlan.sizePlan.join(' / ')} bb</p></div>}
          <ActionGauge title="Répartition suggérée" values={postGauge} />
        </section>
      )}

      {page === 'solver' && (
        <section className="panel">
          <h2>Solveur de spot (avancé)</h2>
          <form className="grid" onSubmit={onSolve}><input value={boardText} readOnly /><input type="number" value={potBb} onChange={(e) => setPotBb(Number(e.target.value))} /><input type="number" value={stackBb} onChange={(e) => setStackBb(Number(e.target.value))} /><button type="submit">Lancer le solve</button></form>
          <div className="range-wrapper"><div><h3>Range IP</h3><div className="range-grid">{rangeCells.map((cell) => <button type="button" key={`ip-${cell.key}`} className={`cell ${weightClass(ipRange[cell.key] ?? 0)}`} onClick={() => updateRangeCell('ip', cell.key)}>{cell.hand}<small>{ipRange[cell.key] ?? 0}%</small></button>)}</div></div><div><h3>Range OOP</h3><div className="range-grid">{rangeCells.map((cell) => <button type="button" key={`oop-${cell.key}`} className={`cell ${weightClass(oopRange[cell.key] ?? 0)}`} onClick={() => updateRangeCell('oop', cell.key)}>{cell.hand}<small>{oopRange[cell.key] ?? 0}%</small></button>)}</div></div></div>
          {solveResult && <div className="solver-output"><p><strong>Check</strong> {solveResult.globalFrequencies.check}% • <strong>Bet33</strong> {solveResult.globalFrequencies.bet33}% • <strong>Bet75</strong> {solveResult.globalFrequencies.bet75}% • <strong>Jam</strong> {solveResult.globalFrequencies.jam}%</p></div>}
        </section>
      )}

      {page === 'tracker' && <section className="panel"><h2>Tracker</h2><form className="grid" onSubmit={onTrack}><input value={trackHand} onChange={(e) => setTrackHand(e.target.value)} placeholder="Main" /><select value={trackStreet} onChange={(e) => setTrackStreet(e.target.value as typeof trackStreet)}><option value="preflop">Préflop</option><option value="flop">Flop</option><option value="turn">Turn</option><option value="river">River</option></select><select value={trackResult} onChange={(e) => setTrackResult(e.target.value as typeof trackResult)}><option value="win">Win</option><option value="loss">Loss</option><option value="tie">Tie</option></select><input type="number" value={trackBb} onChange={(e) => setTrackBb(Number(e.target.value))} placeholder="bb" /><button type="submit">Ajouter</button></form><div className="stats">Mains: {hands.length} • Net: {net.toFixed(1)} bb</div><ul>{[...hands].reverse().map((hand) => (<li key={hand.id}>{hand.hand} · {hand.street} · {hand.result} · {hand.bb}bb</li>))}</ul><button className="danger" type="button" onClick={clearHands}>Vider</button></section>}

      <section className="panel"><h2>Aide sizing rapide</h2><form className="grid" onSubmit={onSizing}><select value={street} onChange={(e) => setStreet(e.target.value as typeof street)}><option value="preflop">Préflop</option><option value="flop">Flop</option><option value="turn">Turn</option><option value="river">River</option></select><input type="number" value={stackBb} onChange={(e) => setStackBb(Number(e.target.value))} placeholder="Stack bb" /><input type="number" value={potBb} onChange={(e) => setPotBb(Number(e.target.value))} placeholder="Pot bb" /><select value={position} onChange={(e) => setPosition(e.target.value as 'ip' | 'oop')}><option value="ip">IP</option><option value="oop">OOP</option></select><button type="submit">Recommander</button></form><p>{sizing}</p></section>
    </main>
  );
}
