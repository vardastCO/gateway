import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from "@nestjs/typeorm";
import { FAQ } from "./base/faq/entities/faq.entity";
import { Blog } from "./base/blog/entities/blog.entity";
import { Area } from "./base/location/area/entities/area.entity";
import { City } from "./base/location/city/entities/city.entity";
import { Country } from "./base/location/country/entities/country.entity";
import { Address } from "./users/address/entities/address.entity";
import { Permission } from "./users/authorization/permission/entities/permission.entity";
import { Role } from "./users/authorization/role/entities/role.entity";
import { ContactInfo } from "./users/contact-info/entities/contact-info.entity";
import { OneTimePassword } from "./users/registration/entities/one-time-password.entity";
import { Province } from "./base/location/province/entities/province.entity";
import { User } from "./users/user/entities/user.entity";
import { Session } from "./users/sessions/entities/session.entity";
import { Favorite } from "./users/favorite/entities/favorite.entity";
import { EventTracker } from "./base/event-tracker/entities/event-tracker.entity";
import { Promote } from "./users/favorite/entities/promote.entity";
import { Project } from "./users/project/entities/project.entity";
import { SellerRepresentative } from "./seller/seller/entities/seller-representative.entity";
import { ContactUs } from "./base/contactus/entities/Contact.entity";
import { ProjectAddress } from "./users/project/entities/addressProject.entity";
import { ProjectHasAddress } from "./users/project/entities/projectHasAddress.entity";
import { UserProject } from "./users/project/entities/user-project.entity";

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => {
    return {
      type: "postgres",
      host: configService.get("DB_HOST", "database"),
      port: parseInt(configService.get("DB_PORT", "5432")),
      username: configService.get("DB_USERNAME", "postgres"),
      password: configService.get("DB_PASSWORD", "vardast@1234"),
      database: configService.get("DB_NAME", "v2"),
      synchronize: configService.get("DB_SYNC", "false") === "true",
      logging: configService.get("DB_QUERY_LOG", "false") === "true",
      cache: true,
      entities: [
        FAQ,
        Address,
        Blog,
        Area,
        City,
        Country,
        Permission,
        Role,
        ContactInfo,
        OneTimePassword,
        Province,
        User,
        Favorite,
        Session,
        EventTracker,
        Promote,
        Project,
        ContactUs,
        SellerRepresentative,
        ProjectAddress,
        ProjectHasAddress,
        UserProject
      ],
    };
  },
};
