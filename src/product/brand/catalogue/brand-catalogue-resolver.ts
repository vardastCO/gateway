import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
// import { BrandCatalogueDto } from '../dto/brandDto-catalogue';
import { BrandCatalogueService } from './brand-catalogue.service';
import { BrandCatalogueDto } from './dto/brandDto-catalogue';
import {
  Param,
  ParseFilePipeBuilder,
  UploadedFile,
} from "@nestjs/common";
@Resolver(() => BrandCatalogueDto)
export class BrandCatalogueResolver {
  constructor(private readonly brandCatalogueService: BrandCatalogueService) {}

  // @Query(() => [BrandCatalogueDto])
  // async getAllBrandCatalogues(): Promise<BrandCatalogueDto[]> {
  //   return this.brandCatalogueService.findAll(); // Implement this method in your service
  // }

  // @Query(() => BrandCatalogueDto)
  // async getBrandCatalogueById(@Args('id', { type: () => Int }) id: number): Promise<[]> {
  //   return // Implement this method in your service
  // }

  // @Mutation(() => BrandCatalogueDto)
  // async uploadBrandCatalogue(@Param('id') brandId: number, 
  // @UploadedFile(
  //   new ParseFilePipeBuilder()
  //     .addFileTypeValidator({
  //       fileType:
  //         /tgz|tar|zip|rar|xlsx|xls|odt|png|gif|tiff|jpg|jpeg|bmp|svg|txt|doc|docx|rtf|pdf/,
  //     })
  //     .addMaxSizeValidator({ maxSize: 5 * 1_000_000 })
  //     .build({ fileIsRequired: true }),
  // )
  // file: Express.Multer.File,): Promise<[]> {
  //   return this.brandCatalogueService.uploadCatalogue(file, brandId);
  // }

  // @Mutation(() => BrandCatalogueDto)
  // async updateBrandCatalogue(@Args('id', { type: () => Int }) id: number, @Args('input') input: BrandCatalogueDto): Promise<[]> {
  //   return  // Implement this method in your service
  // }

  // @Mutation(() => Boolean)
  // async deleteBrandCatalogue(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
  //   return this.brandCatalogueService.delete(id); // Implement this method in your service
  // }
}
