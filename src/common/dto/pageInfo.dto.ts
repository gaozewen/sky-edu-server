import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class PageInfoDTO {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  pageNum: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  pageSize: number;
}
