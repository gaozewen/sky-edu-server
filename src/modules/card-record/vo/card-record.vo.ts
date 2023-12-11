import { Field, ObjectType } from '@nestjs/graphql';

import { CardRecordStatus } from '@/common/constants/enum';
import { CommonVO } from '@/common/vo/common.vo';
import { createGQLResultsVO, createGQLResultVO } from '@/common/vo/result.vo';
import { CardVO } from '@/modules/card/vo/card.vo';
import { CourseVO } from '@/modules/course/vo/course.vo';
import { StoreVO } from '@/modules/store/vo/store.vo';
import { StudentVO } from '@/modules/student/vo/student.vo';

@ObjectType()
export class CardRecordVO extends CommonVO {
  @Field({
    description: '开始时间',
    nullable: true,
  })
  startTime: Date;

  @Field({
    description: '结束时间',
    nullable: true,
  })
  endTime: Date;

  @Field({
    description: '购买时间',
    nullable: true,
  })
  buyTime: Date;

  @Field({
    description: '剩余次数',
  })
  remainTime: number;

  @Field({
    description: '消费卡记录状态',
    nullable: true,
  })
  status?: CardRecordStatus;

  // 关联消费卡
  @Field(() => CardVO, {
    description: '消费卡',
  })
  card: CardVO;

  // 关联学生
  @Field(() => StudentVO, {
    description: '学生',
  })
  student: StudentVO;

  // 关联课程
  @Field(() => CourseVO, {
    description: '课程',
  })
  course: CourseVO;

  // 关联门店
  @Field(() => StoreVO, {
    description: '门店',
  })
  store: StoreVO;
}

@ObjectType()
export class CardRecordResultVO extends createGQLResultVO(CardRecordVO) {}

@ObjectType()
export class CardRecordResultsVO extends createGQLResultsVO(CardRecordVO) {}
