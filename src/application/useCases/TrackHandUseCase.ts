export interface TrackedHand {
  id: string;
  hand: string;
  result: 'win' | 'loss' | 'tie';
  street: 'preflop' | 'flop' | 'turn' | 'river';
  bb: number;
  createdAt: string;
}

export interface HandRepository {
  list(): TrackedHand[];
  save(rows: TrackedHand[]): void;
}

export class TrackHandUseCase {
  constructor(private readonly repository: HandRepository) {}

  add(input: Omit<TrackedHand, 'id' | 'createdAt'>): TrackedHand[] {
    const next = [...this.repository.list(), { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() }];
    this.repository.save(next);
    return next;
  }

  clear(): void {
    this.repository.save([]);
  }

  list(): TrackedHand[] {
    return this.repository.list();
  }
}
