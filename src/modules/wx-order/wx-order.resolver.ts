import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FindOptionsWhere } from 'typeorm';

import { DB_ERROR, SUCCESS, WX_ORDER_NOT_EXIST } from '@/common/constants/code';
import { CurStoreId } from '@/common/decorators/CurStoreId.decorator';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';
import { PageInfoDTO } from '@/common/dto/pageInfo.dto';
import { ResultVO } from '@/common/vo/result.vo';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
import { WxOrder } from './models/wx-order.entity';
import { WxOrderResultsVO, WxOrderResultVO, WxOrderVO } from './vo/wx-order.vo';
import { WxOrderService } from './wx-order.service';

@Resolver(() => WxOrderVO)
@UseGuards(JwtGqlAuthGuard)
export class WxOrderResolver {
  constructor(private readonly wxOrderService: WxOrderService) {}

  @Query(() => WxOrderResultVO)
  async getWxOrder(@Args('id') id: string): Promise<WxOrderResultVO> {
    const result = await this.wxOrderService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '获取成功',
      };
    }
    return {
      code: WX_ORDER_NOT_EXIST,
      message: '微信订单信息不存在',
    };
  }

  @Query(() => WxOrderResultsVO)
  async getWxOrders(
    @Args('pageInfo') pageInfo: PageInfoDTO,
    @JwtUserId() userId: string,
    @CurStoreId() storeId: string,
  ): Promise<WxOrderResultsVO> {
    const { pageNum, pageSize } = pageInfo;
    const where: FindOptionsWhere<WxOrder> = {
      createdBy: userId,
      store: {
        id: storeId,
      },
    };
    const [results, total] = await this.wxOrderService.findWxOrders({
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
  async deleteWxOrder(
    @Args('id') id: string,
    @JwtUserId() userId: string,
  ): Promise<ResultVO> {
    const result = await this.wxOrderService.findById(id);
    if (result) {
      const delRes = await this.wxOrderService.deleteById(id, userId);
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
      code: WX_ORDER_NOT_EXIST,
      message: '微信订单信息不存在',
    };
  }
}
