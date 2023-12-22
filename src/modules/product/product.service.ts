import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

import { ProductStatus } from '@/common/constants/enum';

import { Card } from '../card/models/card.entity';
import { CardRecordService } from '../card-record/card-record.service';
import { Product } from './models/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly cardRecordService: CardRecordService,
  ) {}

  async create(entity: DeepPartial<Product>): Promise<boolean> {
    const res = await this.productRepository.save(
      this.productRepository.create(entity),
    );
    if (res) {
      return true;
    }
    return false;
  }

  async findById(id: string): Promise<Product> {
    return this.productRepository.findOne({
      where: {
        id,
      },
      relations: ['store', 'cards', 'cards.course', 'cards.store'],
    });
  }

  async updateById(id: string, entity: DeepPartial<Product>): Promise<boolean> {
    const existEntity = await this.findById(id);
    if (!existEntity) {
      return false;
    }
    Object.assign(existEntity, entity);
    const res = await this.productRepository.save(existEntity);
    if (res) {
      return true;
    }
    return false;
  }

  async findProducts({
    start,
    length,
    where,
  }: {
    start: number;
    length: number;
    where: FindOptionsWhere<Product>;
  }): Promise<[Product[], number]> {
    return this.productRepository.findAndCount({
      take: length,
      skip: start,
      where,
      order: {
        createdAt: 'DESC',
      },
      relations: ['store'],
    });
  }

  /**
   * 按用户手机端坐标由近及远排序
   */
  async findProductsOrderByDistance({
    start,
    length,
    where,
    position,
  }: {
    start: number;
    length: number;
    where: FindOptionsWhere<Product>;
    position: {
      longitude: number;
      latitude: number;
    };
  }): Promise<{ entities: Product[]; raw: any[] }> {
    return (
      this.productRepository
        .createQueryBuilder('product')
        .select('product')
        .addSelect(
          `
          ST_Distance(
            ST_GeomFromText('POINT(${position.latitude} ${position.longitude})', 4326),
            ST_GeomFromText(CONCAT('POINT(', store.latitude, ' ', store.longitude, ')'), 4326)
          )
        `,
          'distance',
        )
        // 关联的字段是 product.store, 关联的表是 store 表
        .innerJoinAndSelect('product.store', 'store')
        .where(`product.status = '${ProductStatus.LIST}'`)
        .andWhere(`product.name LIKE '%${where.name || ''}%'`)
        .andWhere(
          where.category ? `product.category = '${where.category}'` : '1=1',
        )
        .orderBy('distance', 'ASC')
        .skip(start)
        .take(length)
        .getRawAndEntities()
    );
  }

  async deleteById(id: string, userId: string): Promise<boolean> {
    const res1 = await this.productRepository.update(id, {
      deletedBy: userId,
    });
    if (res1) {
      const res = await this.productRepository.softDelete(id);
      if (res.affected > 0) {
        return true;
      }
    }
    return false;
  }

  async getCount({
    where,
  }: {
    where: FindOptionsWhere<Product>;
  }): Promise<number> {
    return this.productRepository.count({ where });
  }

  // 判断是否消费卡已有学生购买的消费卡记录
  async isCardRecordExists(cards: Card[]): Promise<{
    isExist: boolean;
    cardName: string;
  }> {
    if (cards && cards.length > 0) {
      for (const card of cards) {
        const [, total] = await this.cardRecordService.findCardRecords({
          start: 0,
          length: 1,
          where: {
            card: {
              id: card.id,
            },
          },
        });
        // 消费卡有学生购买的 CardRecord 记录，则无法删除
        if (total && total > 0) {
          return {
            isExist: true,
            cardName: card.name,
          };
        }
      }
    }
    return {
      isExist: false,
      cardName: '',
    };
  }
}
