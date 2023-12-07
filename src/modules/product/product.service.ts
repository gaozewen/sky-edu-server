import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

import { Product, ProductStatus } from './models/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
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
      relations: ['store', 'cards', 'cards.course'],
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
}
