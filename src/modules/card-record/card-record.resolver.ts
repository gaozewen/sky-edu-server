import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FindOptionsWhere } from 'typeorm';

import { CARD_NOT_EXIST, DB_ERROR, SUCCESS } from '@/common/constants/code';
import { CurStoreId } from '@/common/decorators/CurStoreId.decorator';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';
import { PageInfoDTO } from '@/common/dto/pageInfo.dto';
import { ResultVO } from '@/common/vo/result.vo';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
import { CardRecordService } from './card-record.service';
import { CardRecord } from './models/card-record.entity';
import {
  CardRecordResultsVO,
  CardRecordResultVO,
  CardRecordVO,
} from './vo/card-record.vo';

@Resolver(() => CardRecordVO)
@UseGuards(JwtGqlAuthGuard)
export class CardRecordResolver {
  constructor(private readonly cardRecordService: CardRecordService) {}

  @Query(() => CardRecordResultVO)
  async getCardRecord(@Args('id') id: string): Promise<CardRecordResultVO> {
    const result = await this.cardRecordService.findById(id);
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

  @Query(() => CardRecordResultsVO)
  async getCardRecords(
    @Args('pageInfo') pageInfo: PageInfoDTO,
    @Args('courseId') courseId: string,
    @JwtUserId() userId: string,
    @CurStoreId() storeId: string,
  ): Promise<CardRecordResultsVO> {
    const { pageNum, pageSize } = pageInfo;
    const where: FindOptionsWhere<CardRecord> = {
      createdBy: userId,
      course: {
        id: courseId,
      },
      store: {
        id: storeId,
      },
    };
    const [results, total] = await this.cardRecordService.findCardRecords({
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
  async deleteCardRecord(
    @Args('id') id: string,
    @JwtUserId() userId: string,
  ): Promise<ResultVO> {
    const result = await this.cardRecordService.findById(id);
    if (result) {
      const delRes = await this.cardRecordService.deleteById(id, userId);
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
