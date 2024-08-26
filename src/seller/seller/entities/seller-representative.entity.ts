import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user/entities/user.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType()
@Entity("product_seller_representatives")
export class SellerRepresentative extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  sellerId: number;

  @Field(() => User)
  @ManyToOne(() => User, user => null)
  user: Promise<User>;
  @Column()
  userId: number;


  @Field()
  @Column("boolean", { default: false })
  isActive: boolean;

  @Field(() => User)
  @ManyToOne(() => User)
  createdBy: User;
  @Column()
  createdById: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
