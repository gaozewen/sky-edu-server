import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CommonEntity } from '@/common/entities/common.entity';

@Entity('sms')
@Index('idx_tel', ['tel'])
export class SMS extends CommonEntity {
  @PrimaryGeneratedColumn('uuid', { comment: '主键' })
  id: string;

  @PrimaryColumn()
  @Column({ comment: '手机号' })
  tel: string;

  @Column({ comment: '验证码' })
  code: string;
}
