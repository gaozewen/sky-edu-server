import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AdminLoginDTO {
  // mobile: 手机号验证码登录，account：手机号密码登录
  @Field({ description: '登录类型' })
  loginType: string;
  @Field({ description: '商家手机号' })
  tel: string;
  @Field({ description: '手机验证码', nullable: true })
  code?: string;
  @Field({ description: '密码', nullable: true })
  password?: string;
}
