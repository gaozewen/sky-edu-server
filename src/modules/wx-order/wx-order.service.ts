import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

import { WxOrder } from './models/wx-order.entity';

@Injectable()
export class WxOrderService {
  constructor(
    @InjectRepository(WxOrder)
    private readonly wxOrderRepository: Repository<WxOrder>,
  ) {}

  async create(entity: DeepPartial<WxOrder>): Promise<WxOrder> {
    const wxOrder = await this.wxOrderRepository.save(
      this.wxOrderRepository.create(entity),
    );
    return wxOrder;
  }

  async findById(id: string): Promise<WxOrder> {
    return this.wxOrderRepository.findOne({
      where: {
        id,
      },
      relations: ['store'],
    });
  }

  async findByTransactionId(transaction_id: string): Promise<WxOrder> {
    return this.wxOrderRepository.findOne({
      where: {
        transaction_id,
      },
      relations: ['store'],
    });
  }

  async updateById(id: string, entity: DeepPartial<WxOrder>): Promise<boolean> {
    const existEntity = await this.findById(id);
    if (!existEntity) {
      return false;
    }
    Object.assign(existEntity, entity);
    const res = await this.wxOrderRepository.save(existEntity);
    if (res) {
      return true;
    }
    return false;
  }

  async findWxOrders({
    start,
    length,
    where,
  }: {
    start: number;
    length: number;
    where: FindOptionsWhere<WxOrder>;
  }): Promise<[WxOrder[], number]> {
    return this.wxOrderRepository.findAndCount({
      take: length,
      skip: start,
      where,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async deleteById(id: string, userId: string): Promise<boolean> {
    const res1 = await this.wxOrderRepository.update(id, {
      deletedBy: userId,
    });
    if (res1) {
      const res = await this.wxOrderRepository.softDelete(id);
      if (res.affected > 0) {
        return true;
      }
    }
    return false;
  }
}
