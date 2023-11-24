import { Injectable } from '@nestjs/common';
import { Platform, SMSInput, TempType } from './sms.utils';
import { sendAliyunSMS } from './aliyun';
import { sendTencentSMS } from './tencent';

@Injectable()
export class SMSService {
  /**
   *  发送短信
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

      // TODO:
      return true;
    } catch (error) {
      console.error('【所有通道短信发送失败】', error);
      return false; // 发送失败
    }
  }

  /**
   *  发送授权短信
   */
  async sendAuthSMS(phoneNumber: string, code: number): Promise<boolean> {
    return await this.sendSMS({
      phoneNumber,
      tempType: TempType.AUTH,
      templateParams: {
        [Platform.Aliyun]: { code },
        [Platform.Tencent]: [String(code)],
      },
    });
  }
}
