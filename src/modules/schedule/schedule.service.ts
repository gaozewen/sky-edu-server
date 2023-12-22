import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as _ from 'lodash';
import {
  Between,
  DeepPartial,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

import { Schedule } from './models/schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async create(entity: DeepPartial<Schedule>): Promise<boolean> {
    const res = await this.scheduleRepository.save(
      this.scheduleRepository.create(entity),
    );
    if (res) {
      return true;
    }
    return false;
  }

  createEntity(entity: DeepPartial<Schedule>): Schedule {
    return this.scheduleRepository.create(entity);
  }

  async batchCreate(entities: Schedule[]): Promise<Schedule[]> {
    const res = await this.scheduleRepository.save(entities);
    return res;
  }

  async findById(id: string): Promise<Schedule> {
    return this.scheduleRepository.findOne({
      where: {
        id,
      },
      relations: ['course', 'store'],
    });
  }

  async updateById(
    id: string,
    entity: DeepPartial<Schedule>,
  ): Promise<boolean> {
    const existEntity = await this.findById(id);
    if (!existEntity) {
      return false;
    }
    Object.assign(existEntity, entity);
    const res = await this.scheduleRepository.save(existEntity);
    if (res) {
      return true;
    }
    return false;
  }

  async findSchedules({
    start,
    length,
    where,
    noPage, // 不分页
    order,
  }: {
    start?: number;
    length?: number;
    where: FindOptionsWhere<Schedule>;
    noPage?: boolean;
    order?: FindOptionsOrder<Schedule>;
  }): Promise<[Schedule[], number]> {
    let options: FindManyOptions<Schedule> = {
      take: length,
      skip: start,
      where,
      order: order || {
        createdAt: 'DESC',
      },
      relations: [
        'store',
        'course',
        'course.teachers',
        'scheduleRecords',
        'scheduleRecords.schedule',
        'scheduleRecords.student',
      ],
    };
    if (noPage) {
      options = _.omit(options, 'take', 'skip');
    }
    return this.scheduleRepository.findAndCount(options);
  }

  async findValidSchedulesForNext7Days(
    courseId: string,
  ): Promise<[Schedule[], number]> {
    const options: FindManyOptions<Schedule> = {
      where: {
        course: {
          id: courseId,
        },
        schoolDay: Between(
          dayjs().endOf('day').toDate(),
          dayjs().add(7, 'day').endOf('day').toDate(),
        ),
      },
      order: {
        schoolDay: 'ASC',
        startTime: 'ASC',
      },
      relations: ['store', 'course', 'course.teachers'],
    };
    return await this.scheduleRepository.findAndCount(options);
  }

  async deleteById(id: string, userId: string): Promise<boolean> {
    const res1 = await this.scheduleRepository.update(id, {
      deletedBy: userId,
    });
    if (res1) {
      const res = await this.scheduleRepository.softDelete(id);
      if (res.affected > 0) {
        return true;
      }
    }
    return false;
  }
}
