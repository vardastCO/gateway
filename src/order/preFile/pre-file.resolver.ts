import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { Public } from 'src/base/public.decorator';
import { PreFileService } from './pre-file.service';
import { PreOrderDTO } from '../preOrder/dto/preOrderDTO';
import { Permission } from 'src/users/authorization/permission.decorator';
import { CurrentUser } from 'src/users/auth/decorators/current-user.decorator';
import { User } from 'src/users/user/entities/user.entity';
import { AddFilePreOrderInput } from './dto/add-pre-order-file.input';

import { ValidationPipe } from "@nestjs/common";


@Resolver(() => Boolean)
export class PreFileResolver {
  constructor(private readonly preFileService : PreFileService) {}


  @Permission("gql.users.user.update")
  @Mutation(() => Boolean)
  addFilePreOrder(
    @Args('addFilePreOrderInput', { type: () => AddFilePreOrderInput, nullable: true }, new ValidationPipe({ transform: true }))
    addFilePreOrderInput: AddFilePreOrderInput,
    @CurrentUser() user: User
  ) {
  
    return this.preFileService.addFilePreOrder(addFilePreOrderInput,user);
  }

  @Permission("gql.users.user.update")
  @Mutation(() => Boolean)
  removeFilePreOrder(
    @Args('id', { type: () => Int, nullable: true }, new ValidationPipe({ transform: true }))
    id: number,
    @CurrentUser() user: User
  ) {
  
    return this.preFileService.removeFilePreOrder(id,user);
  }

}
