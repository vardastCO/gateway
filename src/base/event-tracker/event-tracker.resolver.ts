import { ExecutionContext } from "@nestjs/common";
import { Args, Context, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { Public } from "src/users/auth/decorators/public.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { User } from "src/users/user/entities/user.entity";
import { Request } from "../utilities/decorators/request.decorator";
import { CreateEventTrackerInput } from "./dto/create-event-tracker.input";
import { EventTracker } from "./entities/event-tracker.entity";
import { EventTrackerService } from "./event-tracker.service";

@Resolver(() => EventTracker)
export class EventTrackerResolver {
  constructor(private readonly eventTrackerService: EventTrackerService) {}

  @Public()
  @Mutation(() => Boolean)
    
  // @Permission("gql.base.event_tracker.create")
  createEventTracker(
    @Args("createEventTrackerInput")
    createEventTrackerInput: CreateEventTrackerInput,
    @CurrentUser() user: User,
  ) : Promise<boolean> {
    return this.eventTrackerService.create(
      createEventTrackerInput,
      user,
    );
  }

  @Permission("gql.base.event_tracker.index")
  @Query(() => [EventTracker], { name: "eventTrackers" })
  findAll() {
    return this.eventTrackerService.findAll();
  }

  @Permission("gql.base.event_tracker.show")
  @Query(() => EventTracker, { name: "eventTracker" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.eventTrackerService.findOne(id);
  }
}
