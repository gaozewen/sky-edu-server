import { Injectable } from '@nestjs/common';

import { SMSService } from '../sms/sms.service';
// 必学这样引入否则会报错
import * as dayjs from 'dayjs';
import { Result } from 'src/common/dto/result.type';
import {
  AUTH_SMS_NOT_EXPIRED,
  GET_AUTH_SMS_FAILED,
  SUCCESS,
} from 'src/common/constants/code';

@Injectable()
export class AuthService {
  constructor(private readonly smsService: SMSService) {}

  // 发送授权短信验证码
  async sendAuthSMS(tel: string): Promise<Result> {
    const sms = await this.smsService.findSMSByTel(tel);
    if (sms) {
      const diffTime = dayjs().diff(dayjs(sms.createdAt));
      // 为了防止盗刷 验证码 24 小时之后过期，一个手机号一天只能发送成功一个验证码
      // H * m * s * ms
      if (diffTime < 24 * 60 * 60 * 1000) {
        // 未过期，直接返回提示
        return {
          code: AUTH_SMS_NOT_EXPIRED,
          message: '验证码尚未过期',
        };
      }
      // 已过期,删除验证码
      await this.smsService.delete(tel);
    }

    const genRandomCode = () => {
      const code = [];
      for (let i = 0; i < 4; i++) {
        code.push(Math.floor(Math.random() * 9));
      }
      return code.join('');
    };

    // 生成验证码
    const code = genRandomCode();
    // 是否发送成功
    const isSuccess = await this.smsService.sendAuthSMS(tel, code);
    if (isSuccess) {
      return {
        code: SUCCESS,
        message: '获取验证码成功',
      };
    }

    return {
      code: GET_AUTH_SMS_FAILED,
      message: '获取验证码失败',
    };
  }
}
