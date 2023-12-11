import { IsNotEmpty } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CardType } from '@/common/constants/enum';
import { CommonEntity } from '@/common/entities/common.entity';
import { Course } from '@/modules/course/models/course.entity';
import { Store } from '@/modules/store/models/store.entity';

/**
 * 消费卡
 */
@Entity('card')
export class Card extends CommonEntity {
  @Column({
    comment: '名称',
    default: '',
  })
  name: string;

  @Column({
    comment: '卡类型',
    default: CardType.TIME,
    type: 'enum',
    enum: CardType,
  })
  @IsNotEmpty()
  type: CardType;

  @Column({
    comment: '上课次数',
    default: 0,
  })
  time: number;

  @Column({
    comment: '有效期',
    default: 0,
    name: 'validate_day',
  })
  validateDay: number;

  // 关联课程
  @ManyToOne(() => Course, (course) => course.cards, {
    cascade: true,
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  // 关联门店
  @ManyToOne(() => Store, (store) => store.cards, {
    cascade: true,
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
