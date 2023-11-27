import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserDTO {
  @Field()
  account: string;
  @Field()
  nickname: string;
  @Field()
  desc: string;
}

@InputType()
export class ProfileDTO {
  @Field()
  avatar: string;
  @Field()
  nickname?: string;
  @Field()
  desc?: string;
}

@InputType()
export class ResetPwdDTO {
  @Field({ description: '用户 ID' })
  id: string;
  @Field({ description: '用户手机号' })
  tel: string;
  @Field({ description: '手机验证码' })
  code: string;
  @Field({ description: '密码' })
  password: string;
}
