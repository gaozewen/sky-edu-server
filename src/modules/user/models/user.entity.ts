import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid', { comment: '主键' })
  id: string;

  @Column({ comment: '账户' })
  account: string;

  @Column({ nullable: true, comment: '密码' })
  password: string;

  @Column({ length: 100, nullable: true, comment: '用户名' })
  @IsNotEmpty()
  name: string;

  @Column({ comment: '描述信息' })
  desc: string;

  @Column({ nullable: true, comment: '手机号' })
  tel: string;
}
