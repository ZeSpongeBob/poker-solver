import { GtoLikeSolver } from '../../domain/services/GtoLikeSolver';

export class SolveSpotUseCase {
  constructor(private readonly solver: GtoLikeSolver) {}

  execute(input: {
    board: string;
    potBb: number;
    stackBb: number;
    ipRange: Record<string, number>;
    oopRange: Record<string, number>;
  }) {
    return this.solver.solve({
      boardText: input.board,
      potBb: input.potBb,
      stackBb: input.stackBb,
      ipRange: input.ipRange,
      oopRange: input.oopRange
    });
  }
}
