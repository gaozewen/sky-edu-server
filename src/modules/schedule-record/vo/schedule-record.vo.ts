import { Field, ObjectType } from '@nestjs/graphql';

import { CommonVO } from '@/common/vo/common.vo';
import { createGQLResultsVO, createGQLResultVO } from '@/common/vo/result.vo';
import { CardRecordVO } from '@/modules/card-record/vo/card-record.vo';
import { CourseVO } from '@/modules/course/vo/course.vo';
import { ScheduleVO } from '@/modules/schedule/vo/schedule.vo';
import { StoreVO } from '@/modules/store/vo/store.vo';
import { StudentVO } from '@/modules/student/vo/student.vo';

@ObjectType()
export class ScheduleRecordVO extends CommonVO {
  // 关联学生
  @Field(() => StudentVO, { description: '学生' })
  student: StudentVO;

  // 关联消费卡记录
  @Field(() => CardRecordVO, { description: '消费卡记录' })
  cardRecord: CardRecordVO;

  // 关联课程表
  @Field(() => ScheduleVO, { description: '课程表' })
  schedule: ScheduleVO;

  // 关联课程
  @Field(() => CourseVO, { description: '课程' })
  course: CourseVO;

  // 关联门店
  @Field(() => StoreVO, { description: '门店' })
  store: StoreVO;
}

@ObjectType()
export class ScheduleRecordResultVO extends createGQLResultVO(
  ScheduleRecordVO,
) {}

@ObjectType()
export class ScheduleRecordResultsVO extends createGQLResultsVO(
  ScheduleRecordVO,
) {}
