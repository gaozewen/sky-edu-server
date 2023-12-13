import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// 必须这样引入否则会报错
import * as dayjs from 'dayjs';
import { FindOptionsWhere, Repository } from 'typeorm';

import { IS_DEV } from '@/common/constants';
import { Platform, TempType } from '@/common/constants/enum';

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

  // 将验证码插入数据库
  private async create(phoneNumber: string, code: string): Promise<boolean> {
    try {
      const res = await this.smsRepository.insert({
        tel: phoneNumber,
        code,
      });
      const isSuccess = res && res.raw && res.raw.affectedRows > 0;
      if (!isSuccess) console.error('【数据库：验证码插入失败】');
      return isSuccess;
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
   * 查询手机号验证码记录
   */
  async findSMSByTel(tel: string): Promise<SMS> {
    const res = await this.smsRepository.findOne({ where: { tel } });
    return res;
  }

  // 删除 SMS 记录
  async delete(tel: string): Promise<boolean> {
    const findOptionsWhere: FindOptionsWhere<SMS> = {
      tel,
    };
    const res = await this.smsRepository.delete(findOptionsWhere);
    return res && res.affected > 0;
  }

  isAuthSMSExpired = (sms: SMS): boolean => {
    const diffTime = dayjs().diff(dayjs(sms.createdAt));
    //  验证码 5 分钟内有效
    // H * m * s * ms
    return diffTime >= 5 * 60 * 1000;
  };
}
