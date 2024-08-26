import { Module } from "@nestjs/common";
import { IsUnique } from "./validations/is-unique.validation";
import { PaginationModule } from './pagination/pagination.module';

@Module({
  providers:  [IsUnique],
  imports: [PaginationModule],
})
export class UtilitiesModule {}
