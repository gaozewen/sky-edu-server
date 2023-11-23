import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OSSDTO {
  @Field({ description: '上传凭证' })
  uploadToken: string;
}
