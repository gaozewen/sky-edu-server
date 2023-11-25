import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sms')
@Index('idx_tel', ['tel'])
export class SMS {
  @PrimaryGeneratedColumn('uuid', { comment: '主键' })
  id: string;

  @PrimaryColumn()
  @Column({ comment: '手机号' })
  tel: string;

  @Column({ comment: '验证码' })
  code: string;

  @Column({
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '创建时间',
  })
  createdAt: Date;
}
