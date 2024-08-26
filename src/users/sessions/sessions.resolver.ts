import { Resolver } from "@nestjs/graphql";
import { Session } from "./entities/session.entity";
import { SessionsService } from "./sessions.service";

@Resolver(() => Session)
export class SessionsResolver {
  constructor(private readonly sessionsService: SessionsService) {}

  // @Mutation(() => Session)
  // createSession(@Args('createSessionInput') createSessionInput: CreateSessionInput) {
  //   return this.sessionsService.create(createSessionInput);
  // }

  // @Query(() => [Session], { name: 'sessions' })
  // findAll() {
  //   return this.sessionsService.findAll();
  // }

  // @Query(() => Session, { name: 'session' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.sessionsService.findOne(id);
  // }

  // @Mutation(() => Session)
  // updateSession(@Args('updateSessionInput') updateSessionInput: UpdateSessionInput) {
  //   return this.sessionsService.update(updateSessionInput.id, updateSessionInput);
  // }

  // @Mutation(() => Session)
  // removeSession(@Args('id', { type: () => Int }) id: number) {
  //   return this.sessionsService.remove(id);
  // }
}
