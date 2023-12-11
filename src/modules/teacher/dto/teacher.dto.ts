import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class TeacherDTO {
  @Field({
    description: '账户',
  })
  account: string;

  @Field({
    description: '密码',
    nullable: true,
  })
  password: string;

  @Field({
    description: '手机号',
    nullable: true,
  })
  tel: string;

  @Field({
    description: '头像',
    nullable: true,
  })
  avatar: string;

  @Field({
    description: '昵称',
  })
  nickname: string;
}
