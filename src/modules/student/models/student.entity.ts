import { Column, Entity } from 'typeorm';

import { CommonEntity } from '@/common/entities/common.entity';

@Entity('student')
export class Student extends CommonEntity {
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

  @Column({
    comment: '微信 openid',
    name: 'wx_openid',
    default: '',
    nullable: true,
  })
  wxOpenid: string;
}
