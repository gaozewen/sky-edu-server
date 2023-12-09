import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FindOptionsWhere } from 'typeorm';

import { DB_ERROR, ORDER_NOT_EXIST, SUCCESS } from '@/common/constants/code';
import { CurStoreId } from '@/common/decorators/CurStoreId.decorator';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';
import { PageInfoDTO } from '@/common/dto/pageInfo.dto';
import { ResultVO } from '@/common/vo/result.vo';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
import { OrderDTO } from './dto/order.dto';
import { Order } from './models/order.entity';
import { OrderService } from './order.service';
import { OrderResultsVO, OrderResultVO, OrderVO } from './vo/order.vo';

@Resolver(() => OrderVO)
@UseGuards(JwtGqlAuthGuard)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Query(() => OrderResultVO)
  async getOrder(@Args('id') id: string): Promise<OrderResultVO> {
    const result = await this.orderService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '获取成功',
      };
    }
    return {
      code: ORDER_NOT_EXIST,
      message: '订单信息不存在',
    };
  }

  @Mutation(() => ResultVO)
  async commitOrder(
    @Args('params') params: OrderDTO,
    @JwtUserId() userId: string,
    @CurStoreId() storeId: string,
    @Args('id', { nullable: true }) id: string,
  ): Promise<ResultVO> {
    if (!id) {
      const res = await this.orderService.create({
        ...params,
        createdBy: userId,
        store: {
          id: storeId,
        },
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
    const order = await this.orderService.findById(id);
    if (order) {
      const res = await this.orderService.updateById(order.id, {
        ...params,
        updatedBy: userId,
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
      code: ORDER_NOT_EXIST,
      message: '订单信息不存在',
    };
  }

  @Query(() => OrderResultsVO)
  async getOrders(
    @Args('pageInfo') pageInfo: PageInfoDTO,
    @JwtUserId() userId: string,
    @CurStoreId() storeId: string,
  ): Promise<OrderResultsVO> {
    const { pageNum, pageSize } = pageInfo;
    const where: FindOptionsWhere<Order> = {
      createdBy: userId,
      store: {
        id: storeId,
      },
    };

    const [results, total] = await this.orderService.findOrders({
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
  async deleteOrder(
    @Args('id') id: string,
    @JwtUserId() userId: string,
  ): Promise<ResultVO> {
    const result = await this.orderService.findById(id);
    if (result) {
      const delRes = await this.orderService.deleteById(id, userId);
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
      code: ORDER_NOT_EXIST,
      message: '订单信息不存在',
    };
  }
}
