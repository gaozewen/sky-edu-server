import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BaseVO {
  @Field()
  id: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  createdBy: string;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  updatedBy: string;

  @Field({ nullable: true })
  deletedAt: Date;

  @Field({ nullable: true })
  deletedBy: string;
}
