import { Field, ObjectType } from '@nestjs/graphql';

import { CommonVO } from '@/common/vo/common.vo';
import { createGQLResultsVO, createGQLResultVO } from '@/common/vo/result.vo';
import { TeacherVO } from '@/modules/teacher/vo/teacher.vo';

@ObjectType()
export class OrderTimeVO {
  @Field({
    description: 'ID',
  })
  id: string;

  @Field({
    description: '开始时间',
  })
  startTime: string;

  @Field({
    description: '结束时间',
  })
  endTime: string;
}

@ObjectType()
export class WeekOrderTimeVO {
  @Field({
    description: '周几',
  })
  week: string;

  @Field(() => [OrderTimeVO], {
    description: '当天可预约时间',
  })
  orderTimes: OrderTimeVO[];
}

@ObjectType()
export class CourseVO extends CommonVO {
  @Field({
    description: '课程封面图',
  })
  coverUrl: string;

  @Field({
    description: '课程名称',
  })
  name: string;

  @Field({
    description: '课程描述',
    nullable: true,
  })
  desc: string;

  @Field({
    description: '适龄人群',
  })
  group: string;

  @Field({
    description: '适合基础',
  })
  baseAbility: string;

  @Field({
    description: '限制上课人数',
  })
  limitNumber: number;

  @Field({
    description: '持续时间',
  })
  duration: number;

  @Field({
    description: '预约信息',
    nullable: true,
  })
  reserveInfo: string;

  @Field({
    description: '退款信息',
    nullable: true,
  })
  refundInfo: string;

  @Field({
    description: '其他说明信息',
    nullable: true,
  })
  otherInfo: string;

  @Field(() => [WeekOrderTimeVO], {
    description: '一周内可约时间',
    nullable: true,
  })
  weeklyOrderTimes: WeekOrderTimeVO[];

  @Field(() => [TeacherVO], {
    description: '任课老师',
    nullable: true,
  })
  teachers: TeacherVO[];
}

@ObjectType()
export class CourseResultVO extends createGQLResultVO(CourseVO) {}

@ObjectType()
export class CourseResultsVO extends createGQLResultsVO(CourseVO) {}
