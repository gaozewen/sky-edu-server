import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import * as dayjs from 'dayjs';
import _ from 'lodash';
import { Between, FindOptionsWhere } from 'typeorm';

import { DB_ERROR, SCHEDULE_NOT_EXIST, SUCCESS } from '@/common/constants/code';
import { CurStoreId } from '@/common/decorators/CurStoreId.decorator';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';
import { PageInfoDTO } from '@/common/dto/pageInfo.dto';
import { ResultVO } from '@/common/vo/result.vo';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
import { CourseService } from '../course/course.service';
import { OrderTimeVO } from '../course/vo/course.vo';
import { Schedule } from './models/schedule.entity';
import { ScheduleService } from './schedule.service';
import {
  ScheduleResultsVO,
  ScheduleResultVO,
  ScheduleVO,
} from './vo/schedule.vo';

@Resolver(() => ScheduleVO)
@UseGuards(JwtGqlAuthGuard)
export class ScheduleResolver {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly courseService: CourseService,
  ) {}

  @Query(() => ScheduleResultVO)
  async getSchedule(@Args('id') id: string): Promise<ScheduleResultVO> {
    const result = await this.scheduleService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '获取成功',
      };
    }
    return {
      code: SCHEDULE_NOT_EXIST,
      message: '课程表信息不存在',
    };
  }

  // 自动排课
  @Mutation(() => ResultVO)
  async autoCreateSchedule(
    @Args('startDay') startDay: string,
    @Args('endDay') endDay: string,
    @JwtUserId() userId: string,
    @CurStoreId() storeId: string,
  ): Promise<ResultVO> {
    // 获取已排好的课表
    const [createdSchedules] = await this.scheduleService.findSchedules({
      where: {
        store: {
          id: storeId,
        },
        schoolDay: Between(dayjs(startDay).toDate(), dayjs(endDay).toDate()),
      },
      noPage: true,
    });
    // 1.获取当前门店下的所有课程
    const [courses] = await this.courseService.findCourses({
      where: {
        store: {
          id: storeId,
        },
      },
      noPage: true,
    });
    // 2.获取每个课程的可约时间
    const schedules = [];
    for (const course of courses) {
      // [
      //   {"week":"Monday","orderTimes":[{"id":"xxx","startTime":"","endTime":""}]}
      // ]
      const weeklyOrderTimes = course.weeklyOrderTimes;
      const weeklyOrderTimeObj: Record<string, OrderTimeVO[]> = {};
      for (const wot of weeklyOrderTimes) {
        weeklyOrderTimeObj[wot.week] = wot.orderTimes;
      }
      // 3.从 startDay 排到 endDay，当天是周几就用周几的可约时间
      let curDay = dayjs(startDay);
      while (curDay.isBefore(dayjs(endDay).add(1, 'd'))) {
        const curWeek = curDay.format('dddd');
        const orderTime = weeklyOrderTimeObj[curWeek];
        if (orderTime && orderTime.length > 0) {
          for (const ot of orderTime) {
            const schedule = new Schedule();
            schedule.startTime = ot.startTime;
            schedule.endTime = ot.endTime;
            schedule.limitNumber = course.limitNumber;
            schedule.store = course.store;
            schedule.course = course;
            schedule.schoolDay = curDay.toDate();
            schedule.createdBy = userId;
            // 是否已经排好（数据库已存在）
            const isScheduled = _.some(
              createdSchedules,
              (item: Schedule) =>
                item.startTime === schedule.startTime &&
                item.endTime === schedule.endTime &&
                item.schoolDay === schedule.schoolDay &&
                item.store.id === schedule.store.id &&
                item.course.id === schedule.course.id,
            );
            if (!isScheduled) {
              schedules.push(this.scheduleService.createEntity(schedule));
            }
          }
        }
        curDay = curDay.add(1, 'd');
      }
    }

    // 去重
    const uniqSchedules = _.uniqWith(
      schedules,
      (a: Schedule, b: Schedule) =>
        a.startTime === b.startTime &&
        a.endTime === b.endTime &&
        a.schoolDay === b.schoolDay &&
        a.store.id === b.store.id &&
        a.course.id === b.course.id,
    );

    const res = await this.scheduleService.batchCreate(uniqSchedules);
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

  @Query(() => ScheduleResultsVO)
  async getSchedules(
    @Args('pageInfo') pageInfo: PageInfoDTO,
    @Args('courseId') courseId: string,
    @JwtUserId() userId: string,
    @CurStoreId() storeId: string,
  ): Promise<ScheduleResultsVO> {
    const { pageNum, pageSize } = pageInfo;
    const where: FindOptionsWhere<Schedule> = {
      createdBy: userId,
      course: {
        id: courseId,
      },
      store: {
        id: storeId,
      },
    };

    const [results, total] = await this.scheduleService.findSchedules({
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
  async deleteSchedule(
    @Args('id') id: string,
    @JwtUserId() userId: string,
  ): Promise<ResultVO> {
    const result = await this.scheduleService.findById(id);
    if (result) {
      const delRes = await this.scheduleService.deleteById(id, userId);
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
      code: SCHEDULE_NOT_EXIST,
      message: '课程表信息不存在',
    };
  }
}
