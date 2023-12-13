import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import * as dayjs from 'dayjs';
import { FindOptionsWhere } from 'typeorm';

import {
  CANCEL_ORDER_COURSE_FAIL,
  DB_ERROR,
  SCHEDULE_RECORD_NOT_EXIST,
  SUCCESS,
} from '@/common/constants/code';
import { CardType, ScheduleRecordStatus } from '@/common/constants/enum';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';
import { PageInfoDTO } from '@/common/dto/pageInfo.dto';
import { genStatus } from '@/common/utils';
import { ResultVO } from '@/common/vo/result.vo';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
import { CardRecordService } from '../card-record/card-record.service';
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
  constructor(
    private readonly scheduleRecordService: ScheduleRecordService,
    private readonly cardRecordService: CardRecordService,
  ) {}

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
    @JwtUserId() userId: string,
  ): Promise<ScheduleRecordResultsVO> {
    const { pageNum, pageSize } = pageInfo;
    const where: FindOptionsWhere<ScheduleRecord> = {
      student: {
        id: userId,
      },
    };

    const [results, total] =
      await this.scheduleRecordService.findScheduleRecords({
        start: pageNum === 1 ? 0 : (pageNum - 1) * pageSize,
        length: pageSize,
        where,
      });

    const data = results.map((r) => ({
      ...r,
      status: genStatus(r),
    }));
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
  @Mutation(() => ResultVO, { description: '取消预约的课程表记录' })
  async cancelOrderCourse(
    @Args('scheduleRecordId') scheduleRecordId: string,
    @JwtUserId() userId: string,
  ): Promise<ResultVO> {
    const scheduleRecord =
      await this.scheduleRecordService.findById(scheduleRecordId);
    if (!scheduleRecord) {
      return {
        code: SCHEDULE_RECORD_NOT_EXIST,
        message: '没有预约记录，不能取消',
      };
    }

    // 已经取消了
    if (scheduleRecord.status === ScheduleRecordStatus.CANCEL) {
      return {
        code: CANCEL_ORDER_COURSE_FAIL,
        message: '取消失败，无需重复取消预约',
      };
    }

    const { schedule, cardRecord } = scheduleRecord;
    const schoolDayStr = dayjs(schedule.schoolDay).format('YYYYMMDD');
    const startTime = dayjs(
      `${schoolDayStr} ${schedule.startTime}`,
      'YYYYMMDD HH:mm:ss',
    );
    // 课程已开始，不能取消
    const curTime = dayjs();
    if (
      curTime.isAfter(startTime.subtract(15, 'm')) &&
      curTime.isBefore(startTime)
    ) {
      return {
        code: CANCEL_ORDER_COURSE_FAIL,
        message: '课程快开始了，不能取消了',
      };
    }

    if (curTime.isAfter(startTime)) {
      return {
        code: CANCEL_ORDER_COURSE_FAIL,
        message: '课程已开始，不能取消了',
      };
    }

    // 取消预约
    let isSuccess = await this.scheduleRecordService.updateById(
      scheduleRecordId,
      {
        status: ScheduleRecordStatus.CANCEL,
        updatedBy: userId,
      },
    );
    if (!isSuccess) {
      return {
        code: CANCEL_ORDER_COURSE_FAIL,
        message: '取消失败，状态更新失败',
      };
    }

    // 归还消费卡次数
    const { card } = cardRecord;
    if (card.type === CardType.TIME) {
      isSuccess = await this.cardRecordService.updateById(cardRecord.id, {
        remainTime: cardRecord.remainTime + 1,
        updatedBy: userId,
      });
      if (!isSuccess) {
        return {
          code: CANCEL_ORDER_COURSE_FAIL,
          message: '归还消费卡次数失败',
        };
      }
    }

    return {
      code: SUCCESS,
      message: '取消成功',
    };
  }
}
