import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

import { Card } from '../card/models/card.entity';
import { StudentService } from '../student/student.service';
import { CardRecord } from './models/card-record.entity';

@Injectable()
export class CardRecordService {
  constructor(
    @InjectRepository(CardRecord)
    private readonly cardRecordRepository: Repository<CardRecord>,
    private readonly studentService: StudentService,
  ) {}

  // 为购买商品的学生添加对应的消费卡记录
  async addCardRecordsForStudent(
    studentId: string,
    cards: Card[],
  ): Promise<boolean> {
    const student = await this.studentService.findById(studentId);

    const crs: CardRecord[] = [];

    for (let index = 0; index < cards.length; index++) {
      const card = cards[index];
      const cr = new CardRecord();
      cr.buyTime = dayjs().toDate();
      cr.startTime = dayjs().toDate();
      cr.endTime = dayjs().add(card.validateDay, 'day').toDate();
      cr.remainTime = card.time;
      cr.card = card;
      cr.student = student;
      cr.course = card.course;
      cr.store = card.store;
      crs.push(await this.cardRecordRepository.create(cr));
    }
    const res = await this.cardRecordRepository.save(crs);

    if (res) {
      return true;
    }
    return false;
  }

  async create(entity: DeepPartial<CardRecord>): Promise<boolean> {
    const res = await this.cardRecordRepository.save(
      this.cardRecordRepository.create(entity),
    );
    if (res) {
      return true;
    }
    return false;
  }

  async findById(id: string): Promise<CardRecord> {
    return this.cardRecordRepository.findOne({
      where: {
        id,
      },
      relations: ['course'],
    });
  }

  async updateById(
    id: string,
    entity: DeepPartial<CardRecord>,
  ): Promise<boolean> {
    const existEntity = await this.findById(id);
    if (!existEntity) {
      return false;
    }
    Object.assign(existEntity, entity);
    const res = await this.cardRecordRepository.save(existEntity);
    if (res) {
      return true;
    }
    return false;
  }

  async findCardRecords({
    start,
    length,
    where,
  }: {
    start: number;
    length: number;
    where: FindOptionsWhere<CardRecord>;
  }): Promise<[CardRecord[], number]> {
    return this.cardRecordRepository.findAndCount({
      take: length,
      skip: start,
      where,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async deleteById(id: string, userId: string): Promise<boolean> {
    const res1 = await this.cardRecordRepository.update(id, {
      deletedBy: userId,
    });
    if (res1) {
      const res = await this.cardRecordRepository.softDelete(id);
      if (res.affected > 0) {
        return true;
      }
    }
    return false;
  }
}
