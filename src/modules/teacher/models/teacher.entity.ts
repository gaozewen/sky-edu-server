import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CommonEntity } from '@/common/entities/common.entity';
import { Store } from '@/modules/store/models/store.entity';

/**
 * 教师
 */
@Entity('teacher')
export class Teacher extends CommonEntity {
  @Column({
    comment: '账户',
  })
  account: string;

  @Column({
    comment: '密码',
  })
  password: string;

  @Column({
    comment: '手机号',
    nullable: true,
  })
  tel: string;

  @Column({
    comment: '头像',
    nullable: true,
  })
  avatar: string;

  @Column({
    comment: '昵称',
    default: '',
  })
  nickname: string;

  // 关联门店
  @ManyToOne(() => Store, (store) => store.teachers, {
    cascade: true,
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
