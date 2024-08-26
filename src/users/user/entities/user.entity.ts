import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Permission } from "src/users/authorization/permission/entities/permission.entity";
import { Session } from "src/users/sessions/entities/session.entity";
import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  Generated,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Country } from "../../../base/location/country/entities/country.entity";
import { Role } from "../../authorization/role/entities/role.entity";
import { UserLanguagesEnum } from "../enums/user-languages.enum";
import { UserStatusesEnum } from "../enums/user-statuses.enum";
import { UserTypeEnum } from "../enums/user-type.enum";

@ObjectType()
@Entity("users")
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  @Generated("uuid")
  uuid: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  identification_code?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  @Column("citext", { nullable: true })
  email?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Index()
  cellphone: string;

  @Field(type => Int, { nullable: true })
  @Column("int8", { nullable: true })
  telegramChatId?: number;

  @Field({ defaultValue: false })
  @Column({ default: false })
  isCellphoneVerified: boolean;

  @Field({ defaultValue: false })
  @Column({ default: false })
  isEmailVerified: boolean;


  @Field()
  @Column({ unique: true })
  username: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  password?: string;


  @Field(type => UserLanguagesEnum)
  @Column({default:UserLanguagesEnum.FARSI})
  language: UserLanguagesEnum;

  @Field({ nullable: true })
  @Column({ nullable: true })
  timezone?: string;

  @Field(type => Country)
  @ManyToOne(type => Country)
  country: Country;

  @Column("int",{default:244})
  countryId: number;

  // @Field(type => File, { nullable: true })
  // @OneToOne(type => File)
  // @JoinColumn()
  // avatarFile: Promise<File>;
  // avatarFileId: number;

  @Field(type => UserStatusesEnum, {
    defaultValue: UserStatusesEnum.ACTIVE,
  })
  @Column({ default: UserStatusesEnum.ACTIVE })
  status: UserStatusesEnum;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  suspensionReason?: string;

  /**
   * Authorization related
   */
  @Field(() => Role)
  @ManyToOne(() => Role, { eager: true })
  displayRole: Promise<Role>;
  @Column("int")
  displayRoleId: number;

  @Field(type => [Role], { nullable: "items" })
  @JoinTable({
    name: "users_authorization_user_roles",
    joinColumn: { name: "userId" },
    inverseJoinColumn: { name: "roleId" },
  })
  @ManyToMany(() => Role, role => role.users, { cascade: true })
  roles: Promise<Role[]>;

  @Field(type => [Permission], { nullable: "items" })
  @JoinTable({
    name: "users_authorization_user_permissions",
    joinColumn: { name: "userId" },
    inverseJoinColumn: { name: "permissionId" },
  })
  @ManyToMany(() => Permission, permission => permission.users)
  permissions: Promise<Permission[]>;

  @Field({ nullable: true })
  @Column({ nullable: true })
  customDisplayRole?: string;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  adminComments?: string;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  lastLoginAt?: string;

  @Field({ nullable: true })
  @Column("inet", { nullable: true })
  lastLoginIP?: string;

  // @Field(() => [UserFavorite], { nullable: true })
  // @OneToMany(() => UserFavorite, (favorite) => favorite.user, { nullable: true })
  // favorites: UserFavorite[];

  @Field({ defaultValue: 0 })
  @Column("int", { default: 0 })
  failedLoginAttempts: number;


  @Field({ nullable: true })
  @Column({ nullable: true })
  createdAt?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  updatedAt?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deletedAt?: string;

  @Field()
  fullName: string;

  @Field(() => [UserTypeEnum],{ nullable: true })
  files?: UserTypeEnum[];

  @Field(() => [Session], { nullable: "items" })
  @OneToMany(() => Session, session => session.user)
  sessions: Promise<Session[]>;


  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  generateFullName(): void {
    if (this.firstName && this.lastName) {
      this.fullName = `${this.firstName} ${this.lastName}`;
    } else if (this.firstName) {
      this.fullName = this.firstName;
    } else if (this.lastName) {
      this.fullName = this.lastName;
    } else {
      this.fullName = 'کاربر'; 
    }
  }

  async wholePermissionNames(): Promise<string[]> {
    const userRoles = await this.roles;
    const [rolePermissionsQuery, rolePermissionsParams] =
      Permission.createQueryBuilder()
        .select("name")
        .innerJoin(
          "users_authorization_role_permissions",
          "rp",
          "rp.permissionId = id",
        )
        .where("rp.roleId IN(:...roleIds)", {
          roleIds:
            userRoles.length !== 0 ? userRoles.map(role => role.id) : [0],
        })
        .getQueryAndParameters();

    const [userPermissionsQuery, userPermissionsParams] =
      Permission.createQueryBuilder()
        .select("name")
        .innerJoin(
          "users_authorization_user_permissions",
          "up",
          "up.permissionId = id",
        )
        .where("up.userId = :userId", {
          userId: this.id,
        })
        .getQueryAndParameters();

    return (
      await User.getRepository().query(
        `${rolePermissionsQuery} UNION ${userPermissionsQuery.replace(
          "$1",
          "$" + (userRoles.length + 1),
        )}`,
        [...rolePermissionsParams, ...userPermissionsParams],
      )
    ).map(permission => permission.name);
  }

  public getPermissionCacheKey(): string | null {
    if (!this.id) {
      return null;
    }
    return `users:${this.id}.permissions`;
  }

  public getRoleCacheKey(): string | null {
    if (!this.id) {
      return null;
    }
    return `users:${this.id}.roles`;
  }
}
