import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { CommonEntity } from '@/common/entities/common.entity';
import { Course } from '@/modules/course/models/course.entity';
import { ScheduleRecord } from '@/modules/schedule-record/models/schedule-record.entity';
import { Store } from '@/modules/store/models/store.entity';
import { Teacher } from '@/modules/teacher/models/teacher.entity';

/**
 * 课程表
 */
@Entity('schedule')
export class Schedule extends CommonEntity {
  @Column({
    comment: '上课日期',
    type: 'timestamp',
    name: 'school_day',
  })
  schoolDay: Date;

  @Column({
    comment: '开始时间',
    name: 'start_time',
  })
  startTime: string;

  @Column({
    comment: '结束时间',
    name: 'end_time',
  })
  endTime: string;

  @Column({
    comment: '人数限制',
    name: 'limit_number',
  })
  limitNumber: number;

  // 关联门店
  @ManyToOne(() => Store, {
    cascade: true,
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  // 关联课程
  @ManyToOne(() => Course, {
    cascade: true,
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  // 关联老师
  @ManyToOne(() => Teacher, {
    cascade: true,
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  // 关联课程表记录
  @OneToMany(() => ScheduleRecord, (scheduleRecord) => scheduleRecord.schedule)
  scheduleRecords: ScheduleRecord[];
}
