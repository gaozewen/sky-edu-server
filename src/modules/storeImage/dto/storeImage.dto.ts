import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class StoreImageDTO {
  @Field({ nullable: true })
  id?: string;

  @Field()
  url: string;

  @Field({ nullable: true })
  remark?: string;
}
