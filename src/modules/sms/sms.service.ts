import { Injectable } from '@nestjs/common';
import { Platform, SMSInput, TempType } from './sms.utils';
import { sendAliyunSMS } from './aliyun';
import { sendTencentSMS } from './tencent';
import { InjectRepository } from '@nestjs/typeorm';
import { SMS } from './models/sms.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
// 必须这样引入否则会报错
import * as dayjs from 'dayjs';

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
      // // 尝试使用阿里云发送短信
      // let isSuccess = await sendAliyunSMS(params);
      // // 二次尝试阿里云
      // if (!isSuccess) isSuccess = await sendAliyunSMS(params);

      // // 切换腾讯云通道
      // if (!isSuccess) isSuccess = await sendTencentSMS(params);

      // // 二次尝试腾讯云
      // if (!isSuccess) isSuccess = await sendTencentSMS(params);

      // return isSuccess;

      // TODO: 开发时默认都发送成功
      return true;
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
    // 为了防止盗刷 验证码 24 小时之后过期，一个手机号一天只能发送成功一个验证码
    // H * m * s * ms
    return diffTime >= 24 * 60 * 60 * 1000;
  };
}
