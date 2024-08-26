import { Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";
import { EntityTypeEnum } from "src/users/favorite/enums/entity-type.enum";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";


@ObjectType()
@Entity("user_favorite")
@Index(["userId"])
@Index(["entityType"]) 
@Index(["entityId"])
export class Favorite extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => EntityTypeEnum, { nullable: true })
  @IsEnum(EntityTypeEnum)
  @Column({
    type: "enum",
    enum: EntityTypeEnum,
    nullable: true,
  })
  entityType: EntityTypeEnum;

  @Field(() => User)
  @ManyToOne(() => User, { nullable: true })
  user: Promise<User>;
  @Column()
  userId: number;

  @Field(() => Int, { nullable: true })
  @Column({
    nullable: true,
  })
  entityId: number;
}
