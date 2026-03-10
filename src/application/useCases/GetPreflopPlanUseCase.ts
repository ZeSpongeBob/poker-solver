import { PreflopAdvisor, PreflopInput } from '../../domain/services/PreflopAdvisor';

export class GetPreflopPlanUseCase {
  constructor(private readonly advisor: PreflopAdvisor) {}

  execute(input: PreflopInput) {
    return this.advisor.advise(input);
  }
}
