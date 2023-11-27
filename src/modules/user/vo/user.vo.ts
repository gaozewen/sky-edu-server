import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserVO {
  @Field()
  readonly id?: string;

  @Field({ description: '用户头像' })
  readonly avatar?: string;

  @Field({ description: '手机号' })
  readonly tel: string;

  @Field()
  readonly nickname?: string;

  @Field()
  readonly desc?: string;

  @Field({ description: '账户信息' })
  readonly account?: string;
}
