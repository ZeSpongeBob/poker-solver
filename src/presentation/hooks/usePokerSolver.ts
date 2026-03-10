import { useMemo, useState } from 'react';
import { ComputeEquityUseCase } from '../../application/useCases/ComputeEquityUseCase';
import { GetPostflopPlanUseCase } from '../../application/useCases/GetPostflopPlanUseCase';
import { GetPreflopPlanUseCase } from '../../application/useCases/GetPreflopPlanUseCase';
import { GetSizingUseCase } from '../../application/useCases/GetSizingUseCase';
import { SolveSpotUseCase } from '../../application/useCases/SolveSpotUseCase';
import { TrackHandUseCase } from '../../application/useCases/TrackHandUseCase';
import { EquityCalculator } from '../../domain/services/EquityCalculator';
import { GtoLikeSolver, SolverOutput } from '../../domain/services/GtoLikeSolver';
import { PostflopAdvisor, PostflopOutput } from '../../domain/services/PostflopAdvisor';
import { PreflopAdvisor, PreflopOutput } from '../../domain/services/PreflopAdvisor';
import { createRangeGrid, defaultRangeWeights } from '../../domain/services/RangeMatrix';
import { SizingAdvisor, Street } from '../../domain/services/SizingAdvisor';
import { LocalStorageHandRepository } from '../../infrastructure/storage/LocalStorageHandRepository';

const cycleWeight = (v: number): number => (v < 25 ? 25 : v < 50 ? 50 : v < 75 ? 75 : v < 100 ? 100 : 0);

export function usePokerSolver() {
  const equityUc = useMemo(() => new ComputeEquityUseCase(new EquityCalculator()), []);
  const sizingUc = useMemo(() => new GetSizingUseCase(new SizingAdvisor()), []);
  const preflopUc = useMemo(() => new GetPreflopPlanUseCase(new PreflopAdvisor()), []);
  const postflopUc = useMemo(() => new GetPostflopPlanUseCase(new PostflopAdvisor()), []);
  const solveUc = useMemo(() => new SolveSpotUseCase(new GtoLikeSolver()), []);
  const trackUc = useMemo(() => new TrackHandUseCase(new LocalStorageHandRepository()), []);

  const rangeCells = useMemo(() => createRangeGrid(), []);
  const [ipRange, setIpRange] = useState<Record<string, number>>(() => defaultRangeWeights());
  const [oopRange, setOopRange] = useState<Record<string, number>>(() => defaultRangeWeights());

  const [equity, setEquity] = useState<string>('Lance une simulation.');
  const [sizing, setSizing] = useState<string>('Calcule un sizing.');
  const [error, setError] = useState<string>('');
  const [refresh, setRefresh] = useState(0);
  const [solveResult, setSolveResult] = useState<SolverOutput | null>(null);
  const [preflopPlan, setPreflopPlan] = useState<PreflopOutput | null>(null);
  const [postflopPlan, setPostflopPlan] = useState<PostflopOutput | null>(null);

  const hands = useMemo(() => trackUc.list(), [trackUc, refresh]);

  const computeEquity = (hero: string, board: string, opponents: number, iterations: number) => {
    setError('');
    try {
      const result = equityUc.execute({ hero, board, opponents, iterations });
      setEquity(`Win ${result.winRate}% • Tie ${result.tieRate}% • Loss ${result.lossRate}%`);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const computeSizing = (street: Street, stackBb: number, potBb: number, position: 'ip' | 'oop') => {
    const res = sizingUc.execute({ street, stackBb, potBb, position });
    setSizing(`SPR ${res.spr} • ${res.sizes.small}/${res.sizes.standard}/${res.sizes.big} bb • ${res.note}`);
  };

  const computePreflopPlan = (input: Parameters<GetPreflopPlanUseCase['execute']>[0]) => setPreflopPlan(preflopUc.execute(input));
  const computePostflopPlan = (input: Parameters<GetPostflopPlanUseCase['execute']>[0]) => setPostflopPlan(postflopUc.execute(input));

  const solveSpot = (board: string, potBb: number, stackBb: number) => {
    const ip = Object.fromEntries(rangeCells.map((c) => [c.hand, ipRange[c.key] ?? 0]));
    const oop = Object.fromEntries(rangeCells.map((c) => [c.hand, oopRange[c.key] ?? 0]));
    setSolveResult(solveUc.execute({ board, potBb, stackBb, ipRange: ip, oopRange: oop }));
  };

  const updateRangeCell = (player: 'ip' | 'oop', key: string) => {
    if (player === 'ip') return setIpRange((prev) => ({ ...prev, [key]: cycleWeight(prev[key] ?? 0) }));
    return setOopRange((prev) => ({ ...prev, [key]: cycleWeight(prev[key] ?? 0) }));
  };

  const addHand = (payload: { hand: string; street: 'preflop' | 'flop' | 'turn' | 'river'; result: 'win' | 'loss' | 'tie'; bb: number }) => {
    trackUc.add(payload);
    setRefresh((v) => v + 1);
  };

  const clearHands = () => { trackUc.clear(); setRefresh((v) => v + 1); };

  return { equity, sizing, error, hands, rangeCells, ipRange, oopRange, solveResult, preflopPlan, postflopPlan, computeEquity, computeSizing, computePreflopPlan, computePostflopPlan, solveSpot, updateRangeCell, addHand, clearHands };
}
