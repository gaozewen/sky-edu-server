import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

import { Store } from './models/store.entity';
@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(entity: DeepPartial<Store>): Promise<boolean> {
    const res = await this.storeRepository.save(
      this.storeRepository.create(entity),
    );
    if (res) {
      return true;
    }
    return false;
  }

  async findById(id: string): Promise<Store> {
    return this.storeRepository.findOne({
      where: {
        id,
      },
      relations: ['frontImgs', 'roomImgs', 'otherImgs'],
    });
  }

  async updateById(id: string, entity: DeepPartial<Store>): Promise<boolean> {
    // TODO：测试 update store 时，是否会自动加上 updatedAt
    const res = await this.storeRepository.update(id, entity);
    if (res.affected > 0) {
      return true;
    }
    return false;

    // 使用 save 方法 update
    // const existEntity = await this.findById(id);
    // if (!existEntity) {
    //   return false;
    // }
    // Object.assign(existEntity, entity);
    // const res = await this.storeRepository.save(existEntity);
    // if (res) {
    //   return true;
    // }
    // return false;
  }

  async findStores({
    start,
    length,
    where,
  }: {
    start: number;
    length: number;
    where: FindOptionsWhere<Store>;
  }): Promise<[Store[], number]> {
    return this.storeRepository.findAndCount({
      take: length,
      skip: start,
      order: {
        createdAt: 'DESC',
      },
      where,
      relations: ['frontImgs', 'roomImgs', 'otherImgs'],
    });
  }

  async deleteById(id: string, userId: string): Promise<boolean> {
    const res1 = await this.storeRepository.update(id, {
      deletedBy: userId,
    });
    if (res1) {
      const res = await this.storeRepository.softDelete(id);
      if (res.affected > 0) {
        return true;
      }
    }
    return false;
  }
}
