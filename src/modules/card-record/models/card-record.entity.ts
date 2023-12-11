import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CommonEntity } from '@/common/entities/common.entity';
import { Card } from '@/modules/card/models/card.entity';
import { Course } from '@/modules/course/models/course.entity';
import { Store } from '@/modules/store/models/store.entity';
import { Student } from '@/modules/student/models/student.entity';

/**
 * 学生购买的消费卡记录
 */
@Entity('card_record')
export class CardRecord extends CommonEntity {
  @Column({
    comment: '开始时间',
    name: 'start_time',
    type: 'datetime',
  })
  startTime: Date;

  @Column({
    comment: '结束时间',
    name: 'end_time',
    type: 'datetime',
  })
  endTime: Date;

  @Column({
    comment: '购买时间',
    name: 'buy_time',
    type: 'datetime',
  })
  buyTime: Date;

  @Column({
    comment: '剩余次数',
    name: 'remain_time',
  })
  remainTime: number;

  // 关联卡片
  @ManyToOne(() => Card, {
    cascade: true,
  })
  @JoinColumn({ name: 'card_id' })
  card: Card;

  // 关联学生
  @ManyToOne(() => Student, {
    cascade: true,
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  // 关联课程
  @ManyToOne(() => Course, {
    cascade: true,
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  // 关联门店
  @ManyToOne(() => Store, {
    cascade: true,
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
