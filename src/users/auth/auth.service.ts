import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { verify } from "argon2";
import { hash } from "argon2";
import { IsNull, MoreThanOrEqual } from "typeorm";
import { Session } from "../sessions/entities/session.entity";
import { DeletionReasons } from "../sessions/enums/deletion-reasons.enum";
import { User } from "../user/entities/user.entity";
import { UserService } from "../user/user.service";
import { LoginResponse } from "./dto/login.response";
import { UserLanguagesEnum } from "../user/enums/user-languages.enum";
import { UserStatusesEnum } from "../user/enums/user-statuses.enum";
import { LoginOTPInput } from "./dto/login-otp.input";
import { Country } from "src/base/location/country/entities/country.entity";
import { Role } from "../authorization/role/entities/role.entity";
import { LogoutResponse } from "./dto/logout.response";
import { RefreshInput } from "./dto/refresh.input";
import { RefreshResponse } from "./dto/refresh.response";
import { OneTimePassword } from "../registration/entities/one-time-password.entity";
import { OneTimePasswordStates } from "../registration/enums/one-time-password-states.enum";
import { OneTimePasswordTypes } from "../registration/enums/one-time-password-types.enum";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { UserDTO } from "./dto/user-dto";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { ContryTypes } from "./enums/country-types.enum";
import { RoleTypes } from "./enums/event-tracker-types.enum";
import { LoginInput } from "./dto/login.input";
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const cacheKey = `validate_user_{username:${username},password:${password}}`;
    const cachedUser: User = await this.cacheManager.get<User>(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }
    const user: User = await this.userService.findOneBy({ username });

    if (user && (await verify(user.password, password))) {
      delete user.password;
      await this.cacheManager.set(cacheKey, user, CacheTTL.ONE_DAY); 
      return user;
    }

    throw new Error("Invalid username or password")
  }
  async loginOTP(
    loginOTPInput: LoginOTPInput,
    requestIP: string,
    agent: string,
  ): Promise<LoginResponse> {
    const now = new Date();
    now.setSeconds(
      now.getSeconds() -
      OneTimePassword.SIGNUP_DEADLINE_AFTER_VALIDATION_SECONDS,
    );

  
    const user: User = await User.findOneBy({ cellphone: loginOTPInput.cellphone });
  
    if (user) {
      const userWholePermissions = await this.userService.cachePermissionsOf(
        user,
      );
      let session = await Session.findOneBy({ userId: user.id });

      if (!session) {
        session = Session.create({
          userId: user.id,
          agent,
          loginIp: requestIP,
        });
        await session.save();
      }
  
      return {
        accessToken: this._generateNewAccessToken(user, session),
        accessTokenTtl: this.configService.get<number>("AUTH_JWT_ACCESS_TTL"),
        refreshToken: this._generateNewRefreshToken(user, session),
        refreshTokenTtl: this.configService.get<number>("AUTH_JWT_REFRESH_TTL"),
        user:user,
        abilities: userWholePermissions,
      };
    }
  
    const userRole = await Role.findOneBy({ name: "user" });
    const createdAtString = new Date().toLocaleString("en-US", {timeZone: "Asia/Tehran"});
    let newUser: User = User.create({
      cellphone: loginOTPInput.cellphone,
      isCellphoneVerified: true,
      username: loginOTPInput.cellphone,
      language: UserLanguagesEnum.FARSI,
      timezone: "Asia/Terhan",
      status: UserStatusesEnum.ACTIVE,
      countryId: ContryTypes.IRAN,
      lastLoginAt: createdAtString,
      lastLoginIP: requestIP,
      displayRoleId: RoleTypes.USER,
    });
    newUser.roles = Promise.resolve([userRole]);
  
    await newUser.save();
    const userWholePermissions = await this.userService.cachePermissionsOf(
      newUser,
    );
    const session = Session.create({
      userId: newUser.id,
      agent,
      loginIp: requestIP,
    });
    await session.save();
    return {
      accessToken: this._generateNewAccessToken(newUser, session),
      accessTokenTtl: this.configService.get<number>("AUTH_JWT_ACCESS_TTL"),
      refreshToken: this._generateNewRefreshToken(newUser, session),
      refreshTokenTtl: this.configService.get<number>("AUTH_JWT_REFRESH_TTL"),
      abilities: userWholePermissions,
      user:newUser,
    };
  }


  async login(
    loginInput: LoginInput,
  ): Promise<LoginResponse> {
    try{

      const user = await this.validateUser(loginInput.username,loginInput.password)

      if (!user) {
        throw new Error("Invalid username or password");
      }
      const userWholePermissions = await this.userService.cachePermissionsOf(
        user,
      );
      const session = Session.create({
        userId: user.id,
        agent : "null",
        loginIp: 'requestIP',
      });
      const [accessToken, refreshToken] = await Promise.all([
        this._generateNewAccessToken(user, session),
        this._generateNewRefreshToken(user, session)
      ]);
      return {
        accessToken: accessToken,
        accessTokenTtl: this.configService.get<number>("AUTH_JWT_ACCESS_TTL"),
        refreshToken: refreshToken,
        refreshTokenTtl: this.configService.get<number>("AUTH_JWT_REFRESH_TTL"),
        abilities:userWholePermissions,
        user:user
      };
    }catch(e){
      throw e;
    }

    
  }


  async refresh(
    refreshInput: RefreshInput,
    user: User,
  ): Promise<RefreshResponse> {
    const { accessToken, refreshToken } = refreshInput;
    let accessTokenPayload, refreshTokenPayload;
    // accessToken should be valid but expired
    try {
      accessTokenPayload = this.jwtService.verify(accessToken, {
        ignoreExpiration: true,
      });
    } catch (e) {
      console.error(e);
      throw new BadRequestException(
        "Access token is not expired yet or is invalid altogether.",
      );
    }

    try {
      refreshTokenPayload = this.jwtService.verify(refreshToken, {
        // maxAge: this.configService.get<number>("AUTH_JWT_REFRESH_TTL"),
        secret: this.configService.get("AUTH_JWT_REFRESH_SECRET"),
      });
    } catch (e) {
      console.error(e);
      throw new BadRequestException("Refresh token is not valid.");
    }

    if (
      !accessTokenPayload.hasOwnProperty("uuid") ||
      !refreshTokenPayload.hasOwnProperty("uuid") ||
      !accessTokenPayload.hasOwnProperty("sid") ||
      !refreshTokenPayload.hasOwnProperty("sid") ||
      (user && accessTokenPayload.uuid != user.uuid) ||
      accessTokenPayload.uuid != refreshTokenPayload.uuid ||
      accessTokenPayload.sid != refreshTokenPayload.sid
    ) {
      throw new BadRequestException("Tokens payload cross integrity problem.");
    }

    if (!user) {
      user = await User.findOneBy({ uuid: accessTokenPayload.uuid });
    }

    const session = await Session.findOneBy({
      id: refreshTokenPayload.sid,
      userId: user.id,
      deletedAt: IsNull(),
      deletionReason: IsNull(),
    });

    if (!session) {
      throw new BadRequestException(
        "Invalid session data, unable to issue new tokens.",
      );
    }

    // get a list of roles and cache it
    await this.userService.cacheRolesOf(user);

    // get a list of all permissions and cache it
    const userWholePermissions = await this.userService.cachePermissionsOf(
      user,
    );
    delete user.password;

    return {
      accessToken: this._generateNewAccessToken(user, session),
      accessTokenTtl: this.configService.get<number>("AUTH_JWT_ACCESS_TTL"),
      refreshToken: this._generateNewRefreshToken(user, session),
      refreshTokenTtl: this.configService.get<number>("AUTH_JWT_REFRESH_TTL"),
      user,
      abilities: userWholePermissions,
    };
  }

  async logout(
    user: User,
    requestIP: string,
    accessToken: string,
  ): Promise<LogoutResponse> {
 
    const accessTokenPayload = this.jwtService.decode(accessToken);
    await Session.update(
      { id: accessTokenPayload["sid"], deletedAt: IsNull() },
      {
        deletedAt: () => "CURRENT_TIMESTAMP",
        deletionReason: DeletionReasons.LOGOUT,
      },
    );
    console.log(
      `us${user.id}er logged out with ip: ${requestIP} and accessToken: ${accessToken}.`,
    );
    return { user };
  }

  private _generateNewAccessToken(user: User, session: Session): string {
    return this.jwtService.sign({
      uuid: user.uuid,
      sid: session.id,
    });
  }

  private _generateNewRefreshToken(user: User, session: Session): string {
    return this.jwtService.sign(
      {
        uuid: user.uuid,
        sid: session.id,
      },
      {
        expiresIn: this.configService.get<number>("AUTH_JWT_REFRESH_TTL"),
        secret: this.configService.get("AUTH_JWT_REFRESH_SECRET"),
      },
    );
  }

  async whoAmI(user: User): Promise<User> {
    const key = `who_user_{id:${user.id}}`;
    const cachedUser = await this.cacheManager.get<User>(key);
    if (cachedUser) {
      return cachedUser;
    } else {
      await this.cacheManager.set(key, user,CacheTTL.ONE_DAY);
      return user;
    }
  }
}
