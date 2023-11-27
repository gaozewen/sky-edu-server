import { IsDate, IsOptional, validateOrReject } from 'class-validator';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

export class CommonEntity {
  @PrimaryGeneratedColumn('uuid', { comment: '主键' })
  id: string;

  @Column({
    comment: '创建时间',
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    comment: '创建者',
    name: 'created_by',
    nullable: true,
  })
  @IsOptional()
  createdBy: string;

  @Column({
    comment: '修改时间',
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    comment: '修改者',
    name: 'updated_by',
    nullable: true,
  })
  @IsOptional()
  updatedBy: string;

  // typeorm 提供的软删除装饰器
  @DeleteDateColumn({
    comment: '删除时间',
    type: 'timestamp',
    name: 'deleted_at',
    nullable: true,
  })
  @IsDate()
  @IsOptional()
  deletedAt: Date;

  @Column({
    comment: '删除者',
    name: 'deleted_by',
    nullable: true,
  })
  @IsOptional()
  deletedBy: string;

  @BeforeInsert()
  setCreatedAtAndUpdatedAt() {
    const now = new Date();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = new Date();
  }

  @BeforeInsert()
  async validateBeforeInsert() {
    await validateOrReject(this);
  }

  @BeforeUpdate()
  async validateBeforeUpdate() {
    await validateOrReject(this, { skipMissingProperties: true });
  }
}
