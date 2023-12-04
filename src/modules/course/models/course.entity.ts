import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { CommonEntity } from '@/common/entities/common.entity';

@Entity('course')
export class Course extends CommonEntity {
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
}
