import { InputType } from "@nestjs/graphql";
import { IndexInput } from "src/base/utilities/dto/index.input";
@InputType()
export class IndexBlogInput extends IndexInput{}
