import { SizingAdvisor, Street } from '../../domain/services/SizingAdvisor';

export class GetSizingUseCase {
  constructor(private readonly advisor: SizingAdvisor) {}

  execute(input: { street: Street; stackBb: number; potBb: number; position: 'ip' | 'oop' }) {
    return this.advisor.suggest({
      street: input.street,
      stackBb: input.stackBb,
      potBb: input.potBb,
      inPosition: input.position === 'ip'
    });
  }
}
