import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FindOptionsWhere } from 'typeorm';

import {
  DB_ERROR,
  SCHEDULE_RECORD_NOT_EXIST,
  SUCCESS,
} from '@/common/constants/code';
import { CurStoreId } from '@/common/decorators/CurStoreId.decorator';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';
import { PageInfoDTO } from '@/common/dto/pageInfo.dto';
import { ResultVO } from '@/common/vo/result.vo';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
import { ScheduleRecord } from './models/schedule-record.entity';
import { ScheduleRecordService } from './schedule-record.service';
import {
  ScheduleRecordResultsVO,
  ScheduleRecordResultVO,
  ScheduleRecordVO,
} from './vo/schedule-record.vo';

@Resolver(() => ScheduleRecordVO)
@UseGuards(JwtGqlAuthGuard)
export class ScheduleRecordResolver {
  constructor(private readonly scheduleRecordService: ScheduleRecordService) {}

  @Query(() => ScheduleRecordResultVO)
  async getScheduleRecord(
    @Args('id') id: string,
  ): Promise<ScheduleRecordResultVO> {
    const result = await this.scheduleRecordService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '获取成功',
      };
    }
    return {
      code: SCHEDULE_RECORD_NOT_EXIST,
      message: '课程表记录信息不存在',
    };
  }

  @Query(() => ScheduleRecordResultsVO)
  async getScheduleRecords(
    @Args('pageInfo') pageInfo: PageInfoDTO,
    @Args('courseId') courseId: string,
    @JwtUserId() userId: string,
    @CurStoreId() storeId: string,
  ): Promise<ScheduleRecordResultsVO> {
    const { pageNum, pageSize } = pageInfo;
    const where: FindOptionsWhere<ScheduleRecord> = {
      createdBy: userId,
      course: {
        id: courseId,
      },
      store: {
        id: storeId,
      },
    };

    const [results, total] =
      await this.scheduleRecordService.findScheduleRecords({
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
  async deleteScheduleRecord(
    @Args('id') id: string,
    @JwtUserId() userId: string,
  ): Promise<ResultVO> {
    const result = await this.scheduleRecordService.findById(id);
    if (result) {
      const delRes = await this.scheduleRecordService.deleteById(id, userId);
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
      code: SCHEDULE_RECORD_NOT_EXIST,
      message: '课程表记录信息不存在',
    };
  }
}
