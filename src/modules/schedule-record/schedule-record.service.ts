import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

import { ScheduleRecord } from './models/schedule-record.entity';

@Injectable()
export class ScheduleRecordService {
  constructor(
    @InjectRepository(ScheduleRecord)
    private readonly scheduleRecordRepository: Repository<ScheduleRecord>,
  ) {}

  async create(entity: DeepPartial<ScheduleRecord>): Promise<ScheduleRecord> {
    const res = await this.scheduleRecordRepository.save(
      this.scheduleRecordRepository.create(entity),
    );
    return res;
  }

  async findById(id: string): Promise<ScheduleRecord> {
    return this.scheduleRecordRepository.findOne({
      where: {
        id,
      },
      relations: ['schedule', 'cardRecord', 'cardRecord.card'],
    });
  }

  async findByScheduleIdAndStudentId(
    scheduleId: string,
    studentId: string,
  ): Promise<ScheduleRecord> {
    return this.scheduleRecordRepository.findOne({
      where: {
        schedule: {
          id: scheduleId,
        },
        student: {
          id: studentId,
        },
      },
    });
  }

  async updateById(
    id: string,
    entity: DeepPartial<ScheduleRecord>,
  ): Promise<boolean> {
    const existEntity = await this.findById(id);
    if (!existEntity) {
      return false;
    }
    Object.assign(existEntity, entity);
    const res = await this.scheduleRecordRepository.save(existEntity);
    if (res) {
      return true;
    }
    return false;
  }

  async findScheduleRecords({
    start,
    length,
    where,
  }: {
    start: number;
    length: number;
    where: FindOptionsWhere<ScheduleRecord>;
  }): Promise<[ScheduleRecord[], number]> {
    return this.scheduleRecordRepository.findAndCount({
      take: length,
      skip: start,
      where,
      order: {
        createdAt: 'DESC',
      },
      relations: [
        'student',
        'cardRecord',
        'schedule',
        'schedule.teacher',
        'course',
        'store',
      ],
    });
  }

  async deleteById(id: string, userId: string): Promise<boolean> {
    const res1 = await this.scheduleRecordRepository.update(id, {
      deletedBy: userId,
    });
    if (res1) {
      const res = await this.scheduleRecordRepository.softDelete(id);
      if (res.affected > 0) {
        return true;
      }
    }
    return false;
  }
}
