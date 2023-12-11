import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FindOptionsWhere, Like } from 'typeorm';

import { DB_ERROR, STORE_NOT_EXIST, SUCCESS } from '@/common/constants/code';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';
import { PageInfoDTO } from '@/common/dto/pageInfo.dto';
import { ResultVO } from '@/common/vo/result.vo';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
import { StoreImageService } from '../store-image/store-image.service';
import { StoreDTO } from './dto/store.dto';
import { Store } from './models/store.entity';
import { StoreService } from './store.service';
import { StoreResultsVO, StoreResultVO, StoreVO } from './vo/store.vo';

@Resolver(() => StoreVO)
@UseGuards(JwtGqlAuthGuard)
export class StoreResolver {
  constructor(
    private readonly storeService: StoreService,
    private readonly storeImageService: StoreImageService,
  ) {}

  @Query(() => StoreResultVO)
  async getStore(@Args('id') id: string): Promise<StoreResultVO> {
    const result = await this.storeService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '获取成功',
      };
    }
    return {
      code: STORE_NOT_EXIST,
      message: '门店信息不存在',
    };
  }

  @Mutation(() => StoreResultVO)
  async commitStore(
    @Args('params') params: StoreDTO,
    @JwtUserId() userId: string,
    @Args('id', { nullable: true }) id?: string,
  ): Promise<ResultVO> {
    if (id) {
      const store = await this.storeService.findById(id);
      if (!store) {
        return {
          code: STORE_NOT_EXIST,
          message: '门店信息不存在',
        };
      }
      const delRes = await this.storeImageService.deleteByStoreId(id);
      if (!delRes) {
        return {
          code: DB_ERROR,
          message: '图片删除不成功，无法更新门店信息',
        };
      }
      const res = await this.storeService.updateById(id, {
        ...params,
        updatedBy: userId,
      });
      if (res) {
        return {
          code: SUCCESS,
          message: '更新成功',
        };
      }
    }
    const res = await this.storeService.create({
      ...params,
      createdBy: userId,
    });
    if (res) {
      return {
        code: SUCCESS,
        message: '创建成功',
      };
    }
    return {
      code: DB_ERROR,
      message: '操作失败',
    };
  }

  @Query(() => StoreResultsVO)
  async getStores(
    @Args('pageInfo') pageInfo: PageInfoDTO,
    @JwtUserId() userId: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<StoreResultsVO> {
    const { pageNum, pageSize } = pageInfo;
    const where: FindOptionsWhere<Store> = { createdBy: userId };
    if (name) {
      where.name = Like(`%${name}%`);
    }
    const [results, total] = await this.storeService.findStores({
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

  @Mutation(() => ResultVO)
  async deleteStore(
    @Args('id') id: string,
    @JwtUserId() userId: string,
  ): Promise<ResultVO> {
    const result = await this.storeService.findById(id);
    if (result) {
      const delRes = await this.storeService.deleteById(id, userId);
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
      code: STORE_NOT_EXIST,
      message: '门店信息不存在',
    };
  }
}
