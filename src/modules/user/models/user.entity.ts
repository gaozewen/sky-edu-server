import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid', { comment: '主键' })
  id: string;

  @Column({ comment: '账户' })
  account: string;

  @Column({ comment: '密码', default: '' })
  password: string;

  @Column({ comment: '手机号' })
  tel: string;

  @Column({
    comment: '用户头像',
    default: 'https://cdn.gaozewen.com/images/avatar_default.jpg',
  })
  avatar: string;

  @Column({ comment: '昵称', default: '', length: 100 })
  @IsNotEmpty()
  nickname: string;

  @Column({ comment: '描述信息', default: '' })
  desc: string;

  @Column({
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '创建时间',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '修改时间',
  })
  updatedAt: Date;
}
