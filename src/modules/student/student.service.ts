import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { Student } from './models/student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  // 新增一个学员
  async create(entity: DeepPartial<Student>): Promise<Student> {
    const createdStudent = await this.studentRepository.save(
      this.studentRepository.create(entity),
    );
    return createdStudent;
  }

  // 修改学员信息
  async updateById(id: string, entity: DeepPartial<Student>): Promise<boolean> {
    const res = await this.studentRepository.update(id, entity);
    return res && res.affected > 0;
  }

  // 通过 ID 查找学员
  async findById(id: string): Promise<Student> {
    return await this.studentRepository.findOne({
      where: { id },
    });
  }

  // 通过账户查找学员
  async findByAccount(account: string): Promise<Student> {
    return await this.studentRepository.findOne({
      where: { account },
    });
  }

  async findStudents({
    start,
    length,
  }: {
    start: number;
    length: number;
  }): Promise<[Student[], number]> {
    return await this.studentRepository.findAndCount({
      take: length,
      skip: start,
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
