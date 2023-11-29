import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class StudentDTO {
  @Field({
    description: '昵称',
  })
  nickname: string;

  @Field({
    description: '手机号',
  })
  tel: string;

  @Field({
    description: '头像',
  })
  avatar: string;
}
