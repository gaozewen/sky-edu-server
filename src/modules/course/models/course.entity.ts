import { IsInt, IsNotEmpty, Min } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  // JoinTable,
  // ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { CommonEntity } from '@/common/entities/common.entity';
import { Card } from '@/modules/card/models/card.entity';
import { Store } from '@/modules/store/models/store.entity';
import { Teacher } from '@/modules/teacher/models/teacher.entity';

import { WeekOrderTimeVO } from '../vo/course.vo';

@Entity('course')
export class Course extends CommonEntity {
  @Column({
    comment: '课程封面图',
    name: 'cover_url',
  })
  coverUrl: string;

  @Column({
    comment: '课程名称',
  })
  @IsNotEmpty()
  name: string;

  @Column({
    comment: '课程描述',
    nullable: true,
    type: 'text',
  })
  desc: string;

  @Column({
    comment: '适龄人群',
  })
  @IsNotEmpty()
  group: string;

  @Column({
    comment: '适合基础',
    name: 'base_ability',
  })
  @IsNotEmpty()
  baseAbility: string;

  @Column({
    comment: '限制上课人数',
    name: 'limit_number',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  limitNumber: number;

  @Column({
    comment: '持续时间',
  })
  @IsNotEmpty()
  duration: number;

  @Column({
    comment: '预约信息',
    name: 'reserve_info',
    nullable: true,
  })
  reserveInfo: string;

  @Column({
    comment: '退款信息',
    name: 'refund_info',
    nullable: true,
  })
  refundInfo: string;

  @Column({
    comment: '其他说明信息',
    name: 'other_info',
    nullable: true,
  })
  otherInfo: string;

  @Column('simple-json', {
    comment: '可约时间',
    name: 'weekly_order_times',
    nullable: true,
  })
  weeklyOrderTimes: WeekOrderTimeVO[];

  @ManyToOne(() => Store, (store) => store.courses)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => Card, (card) => card.course)
  cards: Card[];

  @ManyToMany(() => Teacher, {
    cascade: true,
  })
  @JoinTable({
    name: 'course_teacher',
    joinColumns: [{ name: 'course_id' }],
    inverseJoinColumns: [{ name: 'teacher_id' }],
  })
  teachers: Teacher[];
}
