import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FindOptionsWhere, Like } from 'typeorm';

import { DB_ERROR, PRODUCT_NOT_EXIST, SUCCESS } from '@/common/constants/code';
import { ProductStatus } from '@/common/constants/enum';
import { CurStoreId } from '@/common/decorators/CurStoreId.decorator';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';
import { PageInfoDTO } from '@/common/dto/pageInfo.dto';
import { ResultVO } from '@/common/vo/result.vo';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
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
@UseGuards(JwtGqlAuthGuard)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

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
      const { cardIds } = params;
      const res = await this.productService.updateById(product.id, {
        ...params,
        updatedBy: userId,
        cards:
          cardIds && cardIds.length > 0 ? cardIds.map((i) => ({ id: i })) : [],
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

  @Mutation(() => ResultVO)
  async deleteProduct(
    @Args('id') id: string,
    @JwtUserId() userId: string,
  ): Promise<ResultVO> {
    const result = await this.productService.findById(id);
    if (result) {
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
