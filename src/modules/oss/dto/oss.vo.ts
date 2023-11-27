import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OSSVO {
  @Field({ description: '上传凭证' })
  uploadToken: string;
}
