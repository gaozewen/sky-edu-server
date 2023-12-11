import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class StoreImageVO {
  @Field({ nullable: true })
  id?: string;

  @Field()
  url: string;

  @Field({ nullable: true })
  remark?: string;
}
