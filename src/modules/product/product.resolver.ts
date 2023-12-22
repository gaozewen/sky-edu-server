import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FindOptionsWhere, Like } from 'typeorm';

import {
  CARD_NOT_EXIST,
  CARD_RECORD_EXIST,
  DB_ERROR,
  PRODUCT_NOT_EXIST,
  SUCCESS,
  VALID_SCHEDULE_NOT_EXIST,
} from '@/common/constants/code';
import { ProductStatus } from '@/common/constants/enum';
import { CurStoreId } from '@/common/decorators/CurStoreId.decorator';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';
import { PageInfoDTO } from '@/common/dto/pageInfo.dto';
import { ResultVO } from '@/common/vo/result.vo';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
import { CardRecordService } from '../card-record/card-record.service';
import { ScheduleService } from '../schedule/schedule.service';
import { PRODUCT_CATEGORIES } from './constants/product.category';
import { PartialProductDTO } from './dto/product.dto';
import { Product } from './models/product.entity';
import { ProductService } from './product.service';
import {
  ProductCategoryResultsVO,
  ProductResultsVO,
  ProductResultVO,
  ProductVO,
} from './vo/product.vo';

@Resolver(() => ProductVO)
export class ProductResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly scheduleService: ScheduleService,
    private readonly cardRecordService: CardRecordService,
  ) {}

  @Query(() => ProductResultVO)
  async getProduct(@Args('id') id: string): Promise<ProductResultVO> {
    const result = await this.productService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '获取成功',
      };
    }
    return {
      code: PRODUCT_NOT_EXIST,
      message: '商品信息不存在',
    };
  }

  @UseGuards(JwtGqlAuthGuard)
  @Mutation(() => ResultVO)
  async commitProduct(
    @Args('params') params: PartialProductDTO,
    @JwtUserId() userId: string,
    @CurStoreId() storeId: string,
    @Args('id', { nullable: true }) id: string,
  ): Promise<ResultVO> {
    if (!id) {
      const res = await this.productService.create({
        ...params,
        curStock: params.stock,
        createdBy: userId,
        store: {
          id: storeId,
        },
        status: ProductStatus.UN_LIST,
        cards: [],
      });
      if (res) {
        return {
          code: SUCCESS,
          message: '创建成功',
        };
      }
      return {
        code: DB_ERROR,
        message: '创建失败',
      };
    }
    const product = await this.productService.findById(id);
    if (product) {
      const { cardIds, status } = params;
      const newCards =
        cardIds && cardIds.length > 0 ? cardIds.map((i) => ({ id: i })) : [];
      const { cards } = product;

      // 如果是上架操作
      if (status === ProductStatus.LIST) {
        // 判断是否绑定消费卡
        if (!cards || cards.length === 0) {
          return {
            code: CARD_NOT_EXIST,
            message: '上架失败，未绑定消费卡，请先为商品绑定消费卡',
          };
        }
        // 判断商品绑定的所有课程是否均已排好课，即 schedule 表有相关记录
        for (const card of cards) {
          const [, total] =
            await this.scheduleService.findValidSchedulesForNext7Days(
              card.course.id,
            );
          // 商品消费卡所关联的课程在未来 7 天没有有效的排课记录，不能上架
          if (!total) {
            return {
              code: VALID_SCHEDULE_NOT_EXIST,
              message: `上架失败，课程【${card.course.name}】在未来 7 天不存在有效的排课记录，请先去排课`,
            };
          }
        }
      }

      // 如果是下架操作
      if (status === ProductStatus.UN_LIST) {
        // 已绑定消费卡
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
            // 消费卡有学生购买的 CardRecord 记录，则无法下架
            if (total && total > 0) {
              return {
                code: CARD_RECORD_EXIST,
                message: '下架失败，已有学员购买该商品，无法下架',
              };
            }
          }
        }
      }

      const res = await this.productService.updateById(product.id, {
        ...params,
        updatedBy: userId,
        // 传了 cardIds 参数，才更新 cards
        ...(cardIds ? { cards: newCards } : {}),
      });
      if (res) {
        return {
          code: SUCCESS,
          message: '更新成功',
        };
      }
      return {
        code: DB_ERROR,
        message: '更新失败',
      };
    }
    return {
      code: PRODUCT_NOT_EXIST,
      message: '商品信息不存在',
    };
  }

  @UseGuards(JwtGqlAuthGuard)
  @Query(() => ProductResultsVO)
  async getProducts(
    @Args('pageInfo') pageInfo: PageInfoDTO,
    @JwtUserId() userId: string,
    @CurStoreId() storeId: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<ProductResultsVO> {
    const { pageNum, pageSize } = pageInfo;
    const where: FindOptionsWhere<Product> = {
      createdBy: userId,
      store: {
        id: storeId,
      },
    };
    if (name) {
      where.name = Like(`%${name}%`);
    }
    const [results, total] = await this.productService.findProducts({
      start: pageNum === 1 ? 0 : (pageNum - 1) * pageSize,
      length: pageSize,
      where,
    });
    return {
      code: SUCCESS,
      data: results,
      pageInfo: {
        pageNum,
        pageSize,
        total,
      },
      message: '获取成功',
    };
  }

  @Query(() => ProductResultsVO)
  async getProductsForH5(
    @Args('pageInfo') pageInfo: PageInfoDTO,
    @Args('longitude') longitude: number, // 经度
    @Args('latitude') latitude: number, // 纬度
    @Args('category', { nullable: true }) category?: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<ProductResultsVO> {
    const { pageNum, pageSize } = pageInfo;
    const where: FindOptionsWhere<Product> = {
      status: ProductStatus.LIST,
    };
    if (category) {
      where.category = category;
    }
    if (name) {
      where.name = name;
    }
    const [{ entities, raw }, total] = await Promise.all([
      this.productService.findProductsOrderByDistance({
        start: pageNum === 1 ? 0 : (pageNum - 1) * pageSize,
        length: pageSize,
        where,
        position: {
          longitude,
          latitude,
        },
      }),
      this.productService.getCount({ where }),
    ]);

    return {
      code: SUCCESS,
      data: entities.map((i, index) => {
        const distance = raw[index].distance;
        let distanceLabel = '>5km';
        if (distance >= 0 && distance <= 1000) {
          distanceLabel = `${parseInt(distance.toString())}m`;
        } else if (distance > 1000 && distance <= 5000) {
          distanceLabel = `${(distance / 1000).toFixed(2)}km`;
        }
        return { ...i, distance: distanceLabel };
      }),
      pageInfo: {
        pageNum,
        pageSize,
        total,
      },
      message: '获取成功',
    };
  }

  @Query(() => ProductResultsVO)
  async getProductsByStoreIdForH5(
    @Args('storeId') storeId: string,
  ): Promise<ProductResultsVO> {
    const where: FindOptionsWhere<Product> = {
      store: {
        id: storeId,
      },
      status: ProductStatus.LIST,
    };

    const [results] = await this.productService.findProducts({
      start: 0,
      length: 5,
      where,
    });

    return {
      code: SUCCESS,
      data: results,
      message: '获取成功',
    };
  }

  @UseGuards(JwtGqlAuthGuard)
  @Mutation(() => ResultVO)
  async deleteProduct(
    @Args('id') id: string,
    @JwtUserId() userId: string,
  ): Promise<ResultVO> {
    const product = await this.productService.findById(id);
    if (product) {
      const { status, cards } = product;
      // 商品上架状态，无法删除
      if (status === ProductStatus.LIST) {
        return {
          code: DB_ERROR,
          message: '删除失败，商品上架状态，无法删除',
        };
      }

      // 已绑定消费卡
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
              code: CARD_RECORD_EXIST,
              message: '删除失败，已有学员购买该商品，无法删除',
            };
          }
        }
      }

      const delRes = await this.productService.deleteById(id, userId);
      if (delRes) {
        return {
          code: SUCCESS,
          message: '删除成功',
        };
      }
      return {
        code: DB_ERROR,
        message: '删除失败',
      };
    }
    return {
      code: PRODUCT_NOT_EXIST,
      message: '商品信息不存在',
    };
  }

  @Query(() => ProductCategoryResultsVO)
  async getProductCategories(): Promise<ProductCategoryResultsVO> {
    return {
      code: SUCCESS,
      data: PRODUCT_CATEGORIES,
      message: '获取成功',
    };
  }
}
