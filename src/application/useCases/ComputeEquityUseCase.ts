import { parseCards } from '../../domain/entities/Card';
import { EquityCalculator, EquityResult } from '../../domain/services/EquityCalculator';

export class ComputeEquityUseCase {
  constructor(private readonly calculator: EquityCalculator) {}

  execute(input: { hero: string; board: string; opponents: number; iterations: number }): EquityResult {
    const hero = parseCards(input.hero);
    const board = parseCards(input.board);
    if (hero.length !== 2) throw new Error('Le héros doit avoir 2 cartes.');
    if (![0, 3, 4, 5].includes(board.length)) throw new Error('Le board doit contenir 0, 3, 4 ou 5 cartes.');
    return this.calculator.run(hero, board, input.opponents, input.iterations);
  }
}
