import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user/entities/user.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
} from "typeorm";
import { Project } from "./project.entity";

@ObjectType()
@Entity("user_project")
export class UserProject extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Index()
  name?: string;

  @Field(() => Project)
  @ManyToOne(() => Project)
  project: Promise<Project>;
  @Column()
  @Index()
  projectId: number;

  @Field(() => User)
  @ManyToOne(() => User)
  user: Promise<User>;
  @Column()
  @Index()
  userId: number;


}
