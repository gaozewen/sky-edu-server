import { Field, ObjectType } from '@nestjs/graphql';

import { createGQLResultsVO, createGQLResultVO } from '@/common/vo/result.vo';
import { CourseVO } from '@/modules/course/vo/course.vo';

import { CardType } from '../models/card.entity';

@ObjectType()
export class CardVO {
  @Field({
    description: 'id',
  })
  id: string;

  @Field({
    description: '消费卡名称',
  })
  name: string;

  @Field({
    description: '消费卡类型 ',
    nullable: true,
  })
  type: CardType;

  @Field({
    description: '上课次数',
  })
  time: number;

  @Field({
    description: '有效期（天）',
  })
  validateDay: number;

  @Field(() => CourseVO, {
    description: '课程',
  })
  course: CourseVO;
}

@ObjectType()
export class CardResultVO extends createGQLResultVO(CardVO) {}

@ObjectType()
export class CardResultsVO extends createGQLResultsVO(CardVO) {}
