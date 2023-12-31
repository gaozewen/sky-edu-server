import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';
import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

import { Course } from './models/course.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(entity: DeepPartial<Course>): Promise<boolean> {
    const res = await this.courseRepository.save(
      this.courseRepository.create(entity),
    );
    if (res) {
      return true;
    }
    return false;
  }

  async findById(id: string): Promise<Course> {
    return this.courseRepository.findOne({
      where: {
        id,
      },
      relations: ['teachers'],
    });
  }

  async updateById(id: string, entity: DeepPartial<Course>): Promise<boolean> {
    const existEntity = await this.findById(id);
    if (!existEntity) {
      return false;
    }
    Object.assign(existEntity, entity);
    const res = await this.courseRepository.save(existEntity);
    if (res) {
      return true;
    }
    return false;
  }

  async findCourses({
    start,
    length,
    where,
    noPage, // 不分页
  }: {
    start?: number;
    length?: number;
    where: FindOptionsWhere<Course>;
    noPage?: boolean;
  }): Promise<[Course[], number]> {
    let options: FindManyOptions<Course> = {
      take: length,
      skip: start,
      where,
      order: {
        createdAt: 'DESC',
      },
      relations: ['store', 'teachers'],
    };

    if (noPage) {
      options = _.omit(options, 'take', 'skip');
    }

    return this.courseRepository.findAndCount(options);
  }

  async deleteById(id: string, userId: string): Promise<boolean> {
    const res1 = await this.courseRepository.update(id, {
      deletedBy: userId,
    });
    if (res1) {
      const res = await this.courseRepository.softDelete(id);
      if (res.affected > 0) {
        return true;
      }
    }
    return false;
  }
}
