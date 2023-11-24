import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';
import { Platform, SMSInput, getSMSTemplate } from '../sms.utils';

const createAliyunSMSClient = (): Dysmsapi20170525 => {
  const config = new $OpenApi.Config({
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
  });
  // Endpoint 请参考 https://api.aliyun.com/product/Dysmsapi
  config.endpoint = `dysmsapi.aliyuncs.com`;
  return new Dysmsapi20170525(config);
};

/**
 * 发送阿里云短信
 * @param params SMSInput
 * @returns
 */
export const sendAliyunSMS = async (params: SMSInput): Promise<boolean> => {
  const client = createAliyunSMSClient();
  // 获取阿里云短信模板
  const smsTemp = getSMSTemplate({
    ...params,
    platform: Platform.Aliyun,
  });
  const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
    ...smsTemp,
    phoneNumbers: params.phoneNumber,
  });
  const runtime = new $Util.RuntimeOptions({});
  try {
    const res = await client.sendSmsWithOptions(sendSmsRequest, runtime);
    if (res.body.code !== 'OK') {
      console.error('【阿里云短信发送失败】:', res.body.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('【阿里云短信发送失败】:', error);
    // 请打印 error
    Util.assertAsString(error.message);
    return false;
  }
};
