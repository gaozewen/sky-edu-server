import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import * as dayjs from 'dayjs';
import * as _ from 'lodash';
import { Between, FindOptionsWhere } from 'typeorm';

import {
  CARD_DEPLETED,
  CARD_EXPIRED,
  CARD_RECORD_NOT_EXIST,
  COURSE_NOT_EXIST,
  DB_ERROR,
  ORDER_FAIL,
  SCHEDULE_NOT_EXIST,
  SUCCESS,
} from '@/common/constants/code';
import { CardType } from '@/common/constants/enum';
import { CurStoreId } from '@/common/decorators/CurStoreId.decorator';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';
import { PageInfoDTO } from '@/common/dto/pageInfo.dto';
import { genStatus } from '@/common/utils';
import { ResultVO } from '@/common/vo/result.vo';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
import { CardRecordService } from '../card-record/card-record.service';
import { CourseService } from '../course/course.service';
import { OrderTimeVO } from '../course/vo/course.vo';
import { ScheduleRecordService } from '../schedule-record/schedule-record.service';
import { StoreResultsVO, StoreVO } from '../store/vo/store.vo';
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
    private readonly cardRecordService: CardRecordService,
    private readonly scheduleRecordService: ScheduleRecordService,
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
    // 1.获取当前门店下的所有课程
    const [courses] = await this.courseService.findCourses({
      where: {
        store: {
          id: storeId,
        },
      },
      noPage: true,
    });
    if (!courses || courses.length === 0) {
      return {
        code: COURSE_NOT_EXIST,
        message: '课程不存在，请先去创建课程',
      };
    }

    // 2.获取已排好的课表
    const [createdSchedules] = await this.scheduleService.findSchedules({
      where: {
        store: {
          id: storeId,
        },
        schoolDay: Between(dayjs(startDay).toDate(), dayjs(endDay).toDate()),
      },
      noPage: true,
    });

    // 3.获取每个课程的可约时间
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
      // 4.从 startDay 排到 endDay，当天是周几就用周几的可约时间
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
            schedule.teacher = course.teachers[0];

            // 是否已经排好（数据库已存在）
            const isScheduled = _.some(
              createdSchedules,
              (item: Schedule) =>
                item.startTime === schedule.startTime &&
                item.endTime === schedule.endTime &&
                dayjs(item.schoolDay).toString() ===
                  dayjs(schedule.schoolDay).toString() &&
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

    // 5.去重
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
        message: `排课成功，共新增 ${res.length} 条排课记录`,
      };
    }
    return {
      code: DB_ERROR,
      message: '排课失败',
    };
  }

  @Query(() => ScheduleResultsVO)
  async getTodaySchedules(
    @Args('today') today: string,
    @CurStoreId() storeId: string,
  ): Promise<ScheduleResultsVO> {
    const where: FindOptionsWhere<Schedule> = {
      schoolDay: dayjs(today).toDate(),
      store: {
        id: storeId,
      },
    };

    const [results] = await this.scheduleService.findSchedules({
      noPage: true,
      where,
      order: {
        startTime: 'ASC',
      },
    });

    const data = results.map((schedule) => ({
      ...schedule,
      scheduleRecords: schedule.scheduleRecords.map((sr) => ({
        ...sr,
        status: genStatus(sr),
      })),
    }));

    return {
      code: SUCCESS,
      data,
      message: '获取成功',
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

  @Query(() => StoreResultsVO, {
    description: '获取当前学员可约的课程，按门店分组',
  })
  async getCanOrderedCoursesGroupByStore(
    @JwtUserId() userId: string,
  ): Promise<StoreResultsVO> {
    // 1. 获取当前学员拥有的有效的消费卡记录
    const cardRecords = await this.cardRecordService.findValidCardRecords({
      studentId: userId,
    });
    if (!cardRecords || cardRecords.length === 0) {
      return {
        code: CARD_RECORD_NOT_EXIST,
        message: '没有可用的消费卡，快去购买吧',
      };
    }
    // 2. 获取可约的课
    const courses = cardRecords.map((cr) => cr.course);

    // 3. 去除重复课程
    const uniqCourses = _.uniqBy(courses, 'id');

    // 4. 按照门店，对课程做分组
    const storesObj: Record<string, StoreVO> = {};
    for (const c of uniqCourses) {
      const existStoreVO = storesObj[c.store.id];
      if (existStoreVO) {
        existStoreVO.courses.push(c);
      } else {
        storesObj[c.store.id] = {
          ...c.store,
          courses: [c],
        };
      }
    }
    const stores: StoreVO[] = Object.values(storesObj);
    return {
      code: SUCCESS,
      message: '获取成功',
      data: stores,
      pageInfo: {
        total: stores.length,
      },
    };
  }

  @Query(() => ScheduleResultsVO, {
    description: '获取某一课程近七天的课程表',
  })
  async getSchedulesForNext7DaysByCourse(
    @Args('courseId') courseId: string,
  ): Promise<ScheduleResultsVO> {
    const [entities, count] =
      await this.scheduleService.findValidSchedulesForNext7Days(courseId);

    return {
      code: SUCCESS,
      message: '获取成功',
      data: entities,
      pageInfo: {
        total: count,
      },
    };
  }

  // 学生预约课程
  @Mutation(() => ResultVO, { description: '学生预约课程' })
  async orderCourse(
    @Args('scheduleId') scheduleId: string,
    @Args('cardRecordId') cardRecordId: string,
    @JwtUserId() userId: string,
  ): Promise<ResultVO> {
    // 判断是否已预约过
    let scheduleRecord =
      await this.scheduleRecordService.findByScheduleIdAndStudentId(
        scheduleId,
        userId,
      );
    if (scheduleRecord?.id) {
      return {
        code: ORDER_FAIL,
        message: '无需重复预约同一时间段',
      };
    }

    const cardRecord = await this.cardRecordService.findById(cardRecordId);
    if (!cardRecord) {
      return {
        code: CARD_RECORD_NOT_EXIST,
        message: '消费卡记录不存在',
      };
    }

    // 判断是否过期
    if (dayjs().isAfter(cardRecord.endTime)) {
      return {
        code: CARD_EXPIRED,
        message: '消费卡已过期',
      };
    }

    // 判断次卡是否已耗尽
    const isTimeCard = cardRecord.card.type === CardType.TIME;
    if (isTimeCard && cardRecord.remainTime === 0) {
      return {
        code: CARD_DEPLETED,
        message: '消费卡次数已耗尽',
      };
    }

    const schedule = await this.scheduleService.findById(scheduleId);
    if (!schedule) {
      return {
        code: SCHEDULE_NOT_EXIST,
        message: '课程表不存在',
      };
    }

    // 创建预约记录
    scheduleRecord = await this.scheduleRecordService.create({
      student: {
        id: userId,
      },
      schedule: {
        id: schedule.id,
      },
      cardRecord: {
        id: cardRecordId,
      },
      course: {
        id: schedule.course.id,
      },
      store: {
        id: schedule.store.id,
      },
    });

    if (!scheduleRecord || !scheduleRecord.id) {
      return {
        code: ORDER_FAIL,
        message: '预约失败',
      };
    }

    // 核销消费卡
    // 次卡 -1
    if (isTimeCard) {
      const isSuccess = await this.cardRecordService.updateById(cardRecordId, {
        remainTime: cardRecord.remainTime - 1,
      });
      if (isSuccess) {
        return {
          code: SUCCESS,
          message: '预约成功',
        };
      }
      // 失败要删除预约记录
      await this.scheduleRecordService.deleteById(scheduleRecord.id, userId);
      return {
        code: ORDER_FAIL,
        message: '预约失败',
      };
    }

    // 时长卡无需任何操作
    return {
      code: SUCCESS,
      message: '预约成功',
    };
  }
}
