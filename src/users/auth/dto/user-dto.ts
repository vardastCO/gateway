import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Role } from "src/users/authorization/role/entities/role.entity";
import { UserStatusesEnum } from "src/users/user/enums/user-statuses.enum";


@ObjectType()
export class UserDTO {
  @Field(() => Int)
  id: number;

  @Field()
  uuid: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  cellphone: string;

  @Field(() => Int, { nullable: true })
  telegramChatId?: number;

  @Field()
  isCellphoneVerified: boolean;

  @Field()
  isEmailVerified: boolean;

  @Field()
  isTelegramVerified: boolean;

  @Field()
  username: string;

  @Field({ nullable: true })
  password?: string;

  @Field()
  mustChangePassword: boolean;

  @Field({ nullable: true })
  lastPasswordChangeAt?: Date;


  @Field(() => UserStatusesEnum)
  status: UserStatusesEnum;

  @Field({ nullable: true })
  suspensionReason?: string;

  @Field(() => Role)
  displayRole: Role;

  @Field(() => [Role], { nullable: "items" })
  roles: Role[];

  @Field({ nullable: true })
  customDisplayRole?: string;

  @Field({ nullable: true })
  adminComments?: string;

  @Field({ nullable: true })
  lastLoginAt?: Date;

  @Field({ nullable: true })
  lastLoginIP?: string;

  @Field({ nullable: true })
  lastFailedLoginAt?: Date;

  @Field()
  failedLoginAttempts: number;

  @Field()
  isLockedOut: boolean;

  @Field({ nullable: true })
  lockedOutAt: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  fullName: string;

}
