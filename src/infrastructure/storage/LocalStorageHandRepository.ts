import { HandRepository, TrackedHand } from '../../application/useCases/TrackHandUseCase';

const KEY = 'poker_solver_hands_v2';

export class LocalStorageHandRepository implements HandRepository {
  list(): TrackedHand[] {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TrackedHand[]) : [];
  }

  save(rows: TrackedHand[]): void {
    localStorage.setItem(KEY, JSON.stringify(rows));
  }
}
