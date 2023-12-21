import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// 必须这样引入否则会报错
import * as dayjs from 'dayjs';
import { Between, Repository } from 'typeorm';

import { IS_DEV } from '@/common/constants';
import {
  AUTH_CODE_ERROR,
  AUTH_CODE_EXPIRED,
  SUCCESS,
} from '@/common/constants/code';
import { Platform, TempType } from '@/common/constants/enum';
import { ResultVO } from '@/common/vo/result.vo';

import { sendAliyunSMS } from './aliyun';
import { SMS } from './models/sms.entity';
import { SMSInput } from './sms.utils';
import { sendTencentSMS } from './tencent';

@Injectable()
export class SMSService {
  constructor(
    @InjectRepository(SMS)
    private readonly smsRepository: Repository<SMS>,
  ) {}

  /**
   *  发送短信（此方法不暴露，仅供 SMSService 类内部使用）
   *  要想增加发送其他类型的模板消息，请新增对应的模板接口
   */
  private async sendSMS(params: SMSInput): Promise<boolean> {
    try {
      // TODO: 开发时默认都发送成功
      if (IS_DEV) return true;
      // 尝试使用阿里云发送短信
      let isSuccess = await sendAliyunSMS(params);
      // 二次尝试阿里云
      if (!isSuccess) isSuccess = await sendAliyunSMS(params);

      // 切换腾讯云通道
      if (!isSuccess) isSuccess = await sendTencentSMS(params);

      // 二次尝试腾讯云
      if (!isSuccess) isSuccess = await sendTencentSMS(params);

      return isSuccess;
    } catch (error) {
      console.error('【所有通道短信发送失败】', error);
      return false; // 发送失败
    }
  }

  // 新建短信发送记录
  private async create(phoneNumber: string, code: string): Promise<boolean> {
    try {
      const res = await this.smsRepository.save(
        this.smsRepository.create({
          tel: phoneNumber,
          code,
        }),
      );
      if (res) return true;
      console.error('【数据库：验证码插入失败】');
      return false;
    } catch (error) {
      console.error('【数据库：验证码插入失败】', error);
      return false;
    }
  }

  /**
   *  发送授权短信
   */
  async sendAuthSMS(phoneNumber: string, code: string): Promise<boolean> {
    const isSuccess = await this.sendSMS({
      phoneNumber,
      tempType: TempType.AUTH,
      templateParams: {
        [Platform.Aliyun]: { code },
        [Platform.Tencent]: [code],
      },
    });

    if (isSuccess) {
      return await this.create(phoneNumber, code);
    }

    return false;
  }

  /**
   * 获取该手机号 5 分钟内的所有验证码
   * @param tel 手机号
   */
  async getSMSsWithin5MinutesByTel(tel: string): Promise<[SMS[], number]> {
    return this.smsRepository.findAndCount({
      where: {
        tel,
        createdAt: Between(
          dayjs().subtract(5, 'minute').toDate(),
          dayjs().toDate(),
        ),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * 验证码有效性校验
   * @param tel 手机号
   * @param code 验证码
   * @returns Promise<ResultVO>
   */
  async verifyCodeByTel(code: string, tel: string): Promise<ResultVO> {
    // 1.获取该手机号 5 分钟内的所有验证码
    const [SMSs] = await this.getSMSsWithin5MinutesByTel(tel);

    // 2验证码不存在 || 已过期
    if (!SMSs || SMSs.length === 0) {
      return {
        code: AUTH_CODE_EXPIRED,
        message: '验证码已过期，请重新获取',
      };
    }
    // 3验证码不正确
    if (!SMSs.some((sms) => sms.code === code)) {
      return {
        code: AUTH_CODE_ERROR,
        message: '验证码错误',
      };
    }

    return {
      code: SUCCESS,
      message: '验证成功',
    };
  }

  // 用户获取验证码是否过于频繁
  // (1 分钟之内只能发送一次)
  isGetSMSFrequently = (sms: SMS): boolean => {
    const diffTime = dayjs().diff(dayjs(sms.createdAt));
    // 1 分钟之内用户再次获取，即算频繁
    // H * m * s * ms
    return diffTime < 1 * 60 * 1000;
  };

  isAuthSMSExpired = (sms: SMS): boolean => {
    const diffTime = dayjs().diff(dayjs(sms.createdAt));
    //  验证码 5 分钟内有效
    // H * m * s * ms
    return diffTime >= 5 * 60 * 1000;
  };
}
