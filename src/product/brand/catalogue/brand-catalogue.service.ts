import { Injectable } from '@nestjs/common';
import { BrandCatalogueDto } from './dto/brandDto-catalogue';


@Injectable()
export class BrandCatalogueService {
  private brandCatalogueItems: BrandCatalogueDto[] = []; // Assuming this is your data source, could be a database or any other data storage

  // Create
  // async uploadCatalogue(file: Express.Multer.File,
  //   brandId: number) {
  //     const brand: Brand = await Brand.findOneBy({id: brandId});
  //     if (!brand) {
  //       throw new NotFoundException("Brand Not Found");
  //     }
  
  //     const directory: Directory = await Directory.findOneBy({
  //       path: 'brand/cataloge',
  //     });
  
  //     const filename = File.generateNewFileName(file);
  
  //     const fileRecord: File = File.create<File>({
  //       name: `${directory.path}/${filename}`,
  //       originalName: file.originalname,
  //       size: file.size,
  //       mimeType: file.mimetype,
  //       disk: "minio",
  //       bucketName: this.bucketName,
  //       orderColumn : 1 ,
  //       modelType: directory.relatedModel
  //     });
  //     fileRecord.directory = Promise.resolve(directory);
  //     fileRecord.createdBy = Promise.resolve(user);
     
  //     await this.dataSource.transaction(async () => {
  //       await fileRecord.save({ transaction: false });
  //       const uploadedFileInfo = await this.minioClient.putObject(
  //         this.bucketName,
  //         fileRecord.name,
  //         file.buffer,
  //         {
  //           "Content-Type": file.mimetype,
  //           "File-Uuid": fileRecord.uuid,
  //           "File-Id": fileRecord.id,
  //         },
  //       );
  //     });
  
  //     brand.catalog = Promise.resolve(fileRecord);
  //     // console.log('brand', await brand.catalog)
  //     try {
  
  //       await brand.save();
  //     } catch (e) {
  //       console.log('eee',e)
  //     }
  
  //     // TODO: add retention for files
  //     const fileTTL = 3600;
  //     const oneHourLater = new Date();
  //     oneHourLater.setSeconds(oneHourLater.getSeconds() + fileTTL);

  
  //     return {
  //       uuid: fileRecord.uuid,
  //       expiresAt: oneHourLater,
  //     };
  // }

  // Read all
  findAll(): BrandCatalogueDto[] {
    return 
  }

  // Read by ID
  findById(id: number): BrandCatalogueDto {
    return 
  }

  // Update
  update(id: number, updatedItem: BrandCatalogueDto): BrandCatalogueDto {
   
    return ;
  }

  // Delete
  delete(id: number): boolean {
    
    return ;
  }
}
