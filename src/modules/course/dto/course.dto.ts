import { Field, InputType, PartialType } from '@nestjs/graphql';

@InputType()
class OrderTimeDTO {
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

@InputType()
class WeekOrderTimeDTO {
  @Field({
    description: '周几',
  })
  week: string;

  @Field(() => [OrderTimeDTO], {
    description: '当天可预约时间',
  })
  orderTimes: OrderTimeDTO[];
}

@InputType()
class CourseDTO {
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

  @Field(() => [WeekOrderTimeDTO], {
    description: '一周内可约时间',
    nullable: true,
  })
  weeklyOrderTimes: WeekOrderTimeDTO[];
}

@InputType()
export class PartialCourseDTO extends PartialType(CourseDTO) {}
