import { Field, ObjectType } from '@nestjs/graphql';

import { CommonVO } from '@/common/vo/common.vo';
import { createGQLResultsVO, createGQLResultVO } from '@/common/vo/result.vo';
import { CourseVO } from '@/modules/course/vo/course.vo';
import { StoreVO } from '@/modules/store/vo/store.vo';
import { TeacherVO } from '@/modules/teacher/vo/teacher.vo';

@ObjectType()
export class ScheduleVO extends CommonVO {
  @Field({
    description: '上课日期',
  })
  schoolDay: Date;

  @Field({
    description: '开始时间',
  })
  startTime: string;

  @Field({
    description: '结束时间',
  })
  endTime: string;

  @Field({
    description: '人数限制',
  })
  limitNumber: number;

  // 关联门店
  @Field(() => StoreVO, {
    description: '门店',
  })
  store: StoreVO;

  // 关联课程
  @Field(() => CourseVO, {
    description: '课程',
  })
  course: CourseVO;

  // 关联老师
  @Field(() => TeacherVO, {
    description: '老师',
  })
  teacher: TeacherVO;
}

@ObjectType()
export class ScheduleResultVO extends createGQLResultVO(ScheduleVO) {}

@ObjectType()
export class ScheduleResultsVO extends createGQLResultsVO(ScheduleVO) {}
