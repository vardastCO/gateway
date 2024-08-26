import { ValidationPipe } from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Permission } from "../authorization/permission.decorator";
import { User } from "../user/entities/user.entity";
import { Project } from "./entities/project.entity";
import { ProjectService } from "./project.service";
import { CreateProjectInput } from "./dto/create-project.input";
import { IndexProjectInput } from "./dto/index-project.input";
import { PaginationProjectResponse } from "./dto/pagination-project.response";
import { CreateAddressProjectInput } from "./dto/create-address-project.input";

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Permission("gql.users.address.store")
  @Mutation(() => Project)
  createProject(
    @Args("createProjectInput") createProjectInput: CreateProjectInput,
    @CurrentUser() user: User,
  ) {
    return this.projectService.create(createProjectInput,user.id);
  }

  @Permission("gql.users.address.store")
  @Query(() => [Project], { name: "myProjects" })
  myProjects(
    @CurrentUser() user: User,
  ) {
  
    return this.projectService.myProjects(user.id);
  }
  @Permission("gql.users.address.store")
  @Mutation(() => Project)
  assignAddressProject(
    @Args("createAddressProjectInput") createAddressProjectInput: CreateAddressProjectInput,
    @Args("projectId") projectId: number,
    @CurrentUser() user: User,
  ) {
    return this.projectService.assignAddressProject(createAddressProjectInput,projectId,user);
  }
  @Permission("gql.users.address.store")
  @Mutation(() => Boolean)
  assignUserToProject(
    @Args("projectId") projectId: number,
    @Args("userId") userId: number,
  ) {
    return this.projectService.assignUserToProject(projectId,userId);
  }

  @Permission("gql.users.address.store")
  @Mutation(() => PaginationProjectResponse)
  projects(
    @Args(
      "indexProjectInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexProjectInput?: IndexProjectInput,
  ) {
    return this.projectService.paginate(indexProjectInput);
  }
  @Permission("gql.users.address.store")
  @Query(() => Project, { name: "findOneProject" })
  findOneProject(
    @Args("id") id: number,
  ) {
    return this.projectService.findOneProject(id);
  }
}
