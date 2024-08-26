import { Injectable, NotFoundException } from "@nestjs/common";
import { RabbitSellersService } from "src/rabbit-seller.service";
import { CompressionService } from "src/compression.service";
import { CreateProjectInput } from "./dto/create-project.input";
import { Project } from "./entities/project.entity";
import { UserProject } from "./entities/user-project.entity";
import { IndexProjectInput } from "./dto/index-project.input";
import { PaginationProjectResponse } from "./dto/pagination-project.response";
import { DecompressionService } from "src/decompression.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {In } from 'typeorm';
import {
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { ProjectAddress } from "./entities/addressProject.entity";
import { CreateAddressProjectInput } from "./dto/create-address-project.input";
import { User } from "../user/entities/user.entity";
import { ProjectHasAddress } from "./entities/projectHasAddress.entity";
@Injectable()
export class ProjectService {
  constructor(
    private readonly rabbitSellersService: RabbitSellersService, 
    private readonly compressionService: CompressionService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly decompressionService: DecompressionService,
  )  {}
  async create(createProjectInput: CreateProjectInput,userId:number): Promise<Project> {
    try {
      const project: Project = Project.create<Project>(createProjectInput);
      await project.save();
      const userProject = new UserProject()
      userProject.userId = userId
      userProject.projectId = await project.id

      const cacheKey = `myProject_{userId:${userId}}`;
      await this.cacheManager.del(cacheKey);
     
      await userProject.save();
      return project;
    }catch(e){
      console.log('create project',e)
    }
   
  }
  async myProjects(
    userId?: number,
  ): Promise<Project[]> {
    const cacheKey = `myProject_{userId:${userId}}`;
    
    const [cachedData, result] = await Promise.all([
        this.cacheManager.get<Project[]>(cacheKey),
        Project.find({
          where: { users: { userId: userId } },
          relations: ['users', 'addresses'],
          order: { id: 'DESC' },
        })
    ]);

    if (cachedData) {
        return cachedData;
    }

    if (!result) {
        return null;
    }

    await this.cacheManager.set(cacheKey, result, CacheTTL.ONE_DAY);

    return result;
  
  }
  async assignAddressProject(createAddressProjectInput:CreateAddressProjectInput,projectId:number,user:User): Promise<Project> {
    try {
      const address: ProjectAddress = ProjectAddress.create<ProjectAddress>(createAddressProjectInput);
      address.userId = user.id
      await address.save();

      const projectHasAddress = new ProjectHasAddress()
      projectHasAddress.projectId = projectId
      projectHasAddress.addressId = await address.id
      await projectHasAddress.save();
      await address.save();
      
      return await Project.findOne({
        where: { id: projectId },
        relations: ['users','addresses'],
      });
    }catch(e){
      console.log('create project',e)
    }
   
  }
  async findOneProject(id?: number): Promise<Project> {
    const cacheKey = `project_data_${id}`;
    
    const [cachedData, result] = await Promise.all([
        this.cacheManager.get<Project>(cacheKey),
        Project.findOne({
            where: { id: id },
            relations: ['users','addresses'],
        })
    ]);

    if (cachedData) {
        return cachedData;
    }

    if (!result) {
        return null;
    }

    await this.cacheManager.set(cacheKey, result, CacheTTL.ONE_DAY);

    return result;
}

  async paginate(
    indexProjectInput?: IndexProjectInput,
  ): Promise<PaginationProjectResponse> {
    indexProjectInput.boot();
    const cacheKey = `project_{index:${JSON.stringify(indexProjectInput)}}`;
    
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
 
      return this.decompressionService.decompressData(cachedData);
    }
    const { take, skip } = indexProjectInput || {};
    const [data, total] = await Project.findAndCount({
      skip,
      take,
      where: {},
      order: { id: "DESC" },
    });
    const response = this.compressionService
    .compressData(PaginationProjectResponse.make(indexProjectInput, total, data))
    await this.cacheManager.set(cacheKey,response,CacheTTL.ONE_DAY);
    return PaginationProjectResponse.make(indexProjectInput, total, data);

  }


  async assignUserToProject(projectId: number,userId:number): Promise<boolean> {
    try{
      const userProject = new UserProject()
      userProject.userId = userId
      userProject.projectId = projectId
      await userProject.save();
      return true;
    }catch(e){
      return false
    }
   
  }


}
