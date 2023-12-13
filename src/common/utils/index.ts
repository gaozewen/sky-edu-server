import * as dayjs from 'dayjs';

import { ScheduleRecord } from '@/modules/schedule-record/models/schedule-record.entity';

import { H_M_S_FORMAT } from '../constants';
import { ScheduleRecordStatus } from '../constants/enum';

export const genStatus = (scheduleRecord: ScheduleRecord) => {
  let status = ScheduleRecordStatus.PENDING;
  const { schedule } = scheduleRecord;

  // 如果已经有了，直接返回
  if (scheduleRecord.status) return scheduleRecord.status;

  const { schoolDay, startTime, endTime } = schedule;
  const curDay = dayjs();
  // 和今天是同一天
  if (curDay.isSame(schoolDay, 'day')) {
    if (
      curDay.isAfter(dayjs(startTime, H_M_S_FORMAT)) &&
      curDay.isBefore(dayjs(endTime, H_M_S_FORMAT))
    ) {
      // 正在上课
      status = ScheduleRecordStatus.DOING;
    } else if (curDay.isAfter(dayjs(endTime, H_M_S_FORMAT))) {
      // 上完课了
      status = ScheduleRecordStatus.DONE;
    }
  } else if (curDay.isAfter(schoolDay, 'day')) {
    // 今天在上课日期之后
    // 上完课了
    status = ScheduleRecordStatus.DONE;
  }
  return status;
};
