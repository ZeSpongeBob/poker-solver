import { useMemo, useState } from 'react';
import { ComputeEquityUseCase } from '../../application/useCases/ComputeEquityUseCase';
import { GetSizingUseCase } from '../../application/useCases/GetSizingUseCase';
import { TrackHandUseCase } from '../../application/useCases/TrackHandUseCase';
import { EquityCalculator } from '../../domain/services/EquityCalculator';
import { SizingAdvisor, Street } from '../../domain/services/SizingAdvisor';
import { LocalStorageHandRepository } from '../../infrastructure/storage/LocalStorageHandRepository';

export function usePokerSolver() {
  const equityUc = useMemo(() => new ComputeEquityUseCase(new EquityCalculator()), []);
  const sizingUc = useMemo(() => new GetSizingUseCase(new SizingAdvisor()), []);
  const trackUc = useMemo(() => new TrackHandUseCase(new LocalStorageHandRepository()), []);

  const [equity, setEquity] = useState<string>('Lance une simulation.');
  const [sizing, setSizing] = useState<string>('Calcule un sizing.');
  const [error, setError] = useState<string>('');
  const [refresh, setRefresh] = useState(0);

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

  const addHand = (payload: { hand: string; street: 'preflop' | 'flop' | 'turn' | 'river'; result: 'win' | 'loss' | 'tie'; bb: number }) => {
    trackUc.add(payload);
    setRefresh((v) => v + 1);
  };

  const clearHands = () => {
    trackUc.clear();
    setRefresh((v) => v + 1);
  };

  return { equity, sizing, error, hands, computeEquity, computeSizing, addHand, clearHands };
}
