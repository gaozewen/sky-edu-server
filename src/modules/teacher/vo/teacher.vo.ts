import { Field, ObjectType } from '@nestjs/graphql';

import { CommonVO } from '@/common/vo/common.vo';
import { createGQLResultsVO, createGQLResultVO } from '@/common/vo/result.vo';
import { StoreVO } from '@/modules/store/vo/store.vo';

@ObjectType()
export class TeacherVO extends CommonVO {
  @Field({
    description: '账户',
  })
  account: string;

  @Field({
    description: '密码',
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

  @Field(() => StoreVO, {
    description: '所属门店',
  })
  store: StoreVO;
}

@ObjectType()
export class TeacherResultVO extends createGQLResultVO(TeacherVO) {}

@ObjectType()
export class TeacherResultsVO extends createGQLResultsVO(TeacherVO) {}
