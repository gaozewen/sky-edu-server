import { Field, ObjectType } from '@nestjs/graphql';

import { CommonVO } from '@/common/vo/common.vo';
import { createGQLResultsVO } from '@/common/vo/result.vo';

@ObjectType()
export class StudentVO extends CommonVO {
  @Field({
    description: '账号',
    nullable: true,
  })
  account: string;

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
    nullable: true,
  })
  nickname: string;

  @Field({
    description: '微信 openid',
    nullable: true,
  })
  wxOpenid: string;
}

@ObjectType()
export class StudentResultsVO extends createGQLResultsVO(StudentVO) {}
