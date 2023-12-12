import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import * as dayjs from 'dayjs';
import { FindOptionsWhere } from 'typeorm';

import {
  CARD_RECORD_NOT_EXIST,
  DB_ERROR,
  SUCCESS,
} from '@/common/constants/code';
import { CardRecordStatus, CardType } from '@/common/constants/enum';
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
      code: CARD_RECORD_NOT_EXIST,
      message: '消费卡记录信息不存在',
    };
  }

  @Query(() => CardRecordResultsVO)
  async getCardRecordsForH5(
    @Args('pageInfo') pageInfo: PageInfoDTO,
    @JwtUserId() userId: string,
  ): Promise<CardRecordResultsVO> {
    const { pageNum, pageSize } = pageInfo;
    const where: FindOptionsWhere<CardRecord> = {
      student: {
        id: userId,
      },
    };
    const [results, total] = await this.cardRecordService.findCardRecords({
      start: pageNum === 1 ? 0 : (pageNum - 1) * pageSize,
      length: pageSize,
      where,
    });

    const data = results.map((cr) => {
      let status = CardRecordStatus.VALID;
      if (dayjs().isAfter(cr.endTime)) {
        // 过期了
        status = CardRecordStatus.EXPIRED;
      }
      if (cr.card.type === CardType.TIME && cr.remainTime === 0) {
        // 耗尽了
        status = CardRecordStatus.DEPLETED;
      }
      return {
        ...cr,
        status,
      };
    });
    return {
      code: SUCCESS,
      data,
      pageInfo: {
        pageNum,
        pageSize,
        total,
      },
      message: '获取成功',
    };
  }

  @Query(() => CardRecordResultsVO, {
    description: '获取当前学员在某个课程上有效的(可用的)消费卡记录',
  })
  async getValidCardRecordsByCourse(
    @Args('courseId') courseId: string,
    @JwtUserId() userId: string,
  ): Promise<CardRecordResultsVO> {
    const cardRecords = await this.cardRecordService.findValidCardRecords({
      studentId: userId,
      courseId,
    });
    return {
      code: SUCCESS,
      data: cardRecords,
      pageInfo: {
        total: cardRecords.length,
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
      code: CARD_RECORD_NOT_EXIST,
      message: '消费卡记录信息不存在',
    };
  }
}
