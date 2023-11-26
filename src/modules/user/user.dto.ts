import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class UserInput {
  @Field()
  account: string;
  @Field()
  nickname: string;
  @Field()
  desc: string;
}

@ObjectType()
export class UserDTO {
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

@InputType()
export class ProfileInput {
  @Field()
  avatar: string;
  @Field()
  nickname?: string;
  @Field()
  desc?: string;
}
