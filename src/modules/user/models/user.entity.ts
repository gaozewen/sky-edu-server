import { IsNotEmpty } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { CommonEntity } from '@/common/entities/common.entity';

@Entity('user')
export class User extends CommonEntity {
  @Column({ comment: '账户' })
  account: string;

  @Column({ comment: '密码', default: '' })
  password: string;

  @Column({ comment: '手机号' })
  @IsNotEmpty()
  tel: string;

  @Column({
    comment: '用户头像',
    default: 'https://cdn.gaozewen.com/images/avatar_default.jpg',
  })
  avatar: string;

  @Column({ comment: '昵称', default: '', length: 100 })
  nickname: string;

  @Column({ comment: '描述信息', default: '' })
  desc: string;
}
