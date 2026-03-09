import { PostflopAdvisor, PostflopInput } from '../../domain/services/PostflopAdvisor';

export class GetPostflopPlanUseCase {
  constructor(private readonly advisor: PostflopAdvisor) {}

  execute(input: PostflopInput) {
    return this.advisor.advise(input);
  }
}
