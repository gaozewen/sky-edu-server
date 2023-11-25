import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid', { comment: '主键' })
  id: string;

  @Column({ comment: '账户' })
  account: string;

  @Column({ comment: '密码', default: '' })
  password: string;

  @Column({ comment: '昵称', default: '', length: 100 })
  @IsNotEmpty()
  nickname: string;

  @Column({ comment: '描述信息', default: '' })
  desc: string;

  @Column({ comment: '手机号' })
  tel: string;

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
