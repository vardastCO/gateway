import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { City } from "src/base/location/city/entities/city.entity";
import { Country } from "src/base/location/country/entities/country.entity";
import { Province } from "src/base/location/province/entities/province.entity";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
  UpdateDateColumn,
} from "typeorm";


@ObjectType()
@Entity("users_addresses_project")
export class ProjectAddress extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  @Index()
  userId: number;

  @Field()
  @Column()
  @Index()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Index()
  delivery_contact?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Index()
  delivery_name?: string;

  @Field(() => City)
  @ManyToOne(() => City)
  city: Promise<City>;
  @Column()
  @Index()
  cityId: number;

  @Field(() => Province,{nullable:true})
  @ManyToOne(() => Province)
  province: Promise<Province>;
  @Column({nullable:true})
  @Index()
  provinceId?: number;

  @Field()
  @Column()
  @Index()
  postalAddress: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Index()
  postalCode?: string;


  @Field(() => ThreeStateSupervisionStatuses)
  @Column("enum", {
    enum: ThreeStateSupervisionStatuses,
    default: ThreeStateSupervisionStatuses.CONFIRMED,
  })
  status: ThreeStateSupervisionStatuses;

  

  @Field()
  @CreateDateColumn()
  createdAt: Date;

}
