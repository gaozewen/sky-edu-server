import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { ScheduleRecordStatus } from '@/common/constants/enum';
import { CommonEntity } from '@/common/entities/common.entity';
import { CardRecord } from '@/modules/card-record/models/card-record.entity';
import { Course } from '@/modules/course/models/course.entity';
import { Schedule } from '@/modules/schedule/models/schedule.entity';
import { Store } from '@/modules/store/models/store.entity';
import { Student } from '@/modules/student/models/student.entity';

/**
 * 课程表记录
 */
@Entity('schedule_record')
export class ScheduleRecord extends CommonEntity {
  @Column({
    comment: '课程表记录状态',
    type: 'enum',
    enum: ScheduleRecordStatus,
    nullable: true,
  })
  status: ScheduleRecordStatus;

  // 关联学生
  @ManyToOne(() => Student, { cascade: true })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  // 关联消费卡记录
  @ManyToOne(() => CardRecord, { cascade: true })
  @JoinColumn({ name: 'card_record_id' })
  cardRecord: CardRecord;

  // 关联课程表
  @ManyToOne(() => Schedule, { cascade: true })
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;

  // 关联课程
  @ManyToOne(() => Course, { cascade: true })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  // 关联门店
  @ManyToOne(() => Store, { cascade: true })
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
