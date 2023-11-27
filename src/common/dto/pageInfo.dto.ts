import { Field, InputType } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class PageInfoDTO {
  @Field()
  @IsInt()
  @Min(0)
  pageNum: number;

  @Field()
  @IsInt()
  @Min(0)
  pageSize: number;
}
