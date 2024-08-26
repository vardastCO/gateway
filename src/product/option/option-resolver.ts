import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { ParentProductDTO } from '../parent/dto/parentProductDTO';
import { OptionService } from './option.service';
import { OptionDTO } from './dto/optionDTO';
import { CreateOptionInput } from './dto/create-options.input';

@Resolver(() => OptionDTO)
export class OptionResolver {
  constructor(private readonly optionService : OptionService) {}

  // @Query(() => [OptionDTO])
  // async getAllOptions(): Promise<OptionDTO[]> {
  //   return this.optionService.findAll();
  // }

  // @Query(() => OptionDTO)
  // async getOptionById(@Args('id', { type: () => Int }) id: number): Promise<OptionDTO> {
  //   return this.optionService.findById(id);
  // }

  @Mutation(() => Boolean)
  async createOption(
    @Args("createOptionInput") createOptionInput: CreateOptionInput,
  ): Promise<boolean> {
    return this.optionService.create(createOptionInput);
  }

  // @Mutation(() => OptionDTO)
  // async updateOption(
  //   @Args('id', { type: () => Int }) id: number,
  //   @Args('valueId', { type: () => Int }) valueId: number,
  //   @Args('productId', { type: () => Int }) productId: number,
  // ): Promise<OptionDTO> {
  //   return this.optionService.update(id, { valueId, productId });
  // }

  @Mutation(() => Boolean)
  async deleteOption(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    await this.optionService.delete(id);
    return true;
  }
}
