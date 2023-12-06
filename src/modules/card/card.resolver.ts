import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FindOptionsWhere, Like } from 'typeorm';

import { CARD_NOT_EXIST, DB_ERROR, SUCCESS } from '@/common/constants/code';
import { CurStoreId } from '@/common/decorators/CurStoreId.decorator';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';
import { PageInfoDTO } from '@/common/dto/pageInfo.dto';
import { ResultVO } from '@/common/vo/result.vo';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
import { CardService } from './card.service';
import { CardDTO } from './dto/card.dto';
import { Card } from './models/card.entity';
import { CardResultsVO, CardResultVO, CardVO } from './vo/card.vo';

@Resolver(() => CardVO)
@UseGuards(JwtGqlAuthGuard)
export class CardResolver {
  constructor(private readonly cardService: CardService) {}

  @Query(() => CardResultVO)
  async getCard(@Args('id') id: string): Promise<CardResultVO> {
    const result = await this.cardService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '获取成功',
      };
    }
    return {
      code: CARD_NOT_EXIST,
      message: '消费卡信息不存在',
    };
  }

  @Mutation(() => ResultVO)
  async commitCard(
    @Args('params') params: CardDTO,
    @Args('courseId') courseId: string,
    @JwtUserId() userId: string,
    @CurStoreId() storeId: string,
    @Args('id', { nullable: true }) id: string,
  ): Promise<ResultVO> {
    if (!id) {
      const res = await this.cardService.create({
        ...params,
        createdBy: userId,
        course: {
          id: courseId,
        },
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
    const card = await this.cardService.findById(id);
    if (card) {
      const res = await this.cardService.updateById(card.id, {
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
      code: CARD_NOT_EXIST,
      message: '消费卡信息不存在',
    };
  }

  @Query(() => CardResultsVO)
  async getCards(
    @Args('pageInfo') pageInfo: PageInfoDTO,
    @Args('courseId') courseId: string,
    @JwtUserId() userId: string,
    @CurStoreId() storeId: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<CardResultsVO> {
    const { pageNum, pageSize } = pageInfo;
    const where: FindOptionsWhere<Card> = {
      createdBy: userId,
      course: {
        id: courseId,
      },
      store: {
        id: storeId,
      },
    };
    if (name) {
      where.name = Like(`%${name}%`);
    }
    const [results, total] = await this.cardService.findCards({
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
  async deleteCard(
    @Args('id') id: string,
    @JwtUserId() userId: string,
  ): Promise<ResultVO> {
    const result = await this.cardService.findById(id);
    if (result) {
      const delRes = await this.cardService.deleteById(id, userId);
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
      code: CARD_NOT_EXIST,
      message: '消费卡信息不存在',
    };
  }
}
