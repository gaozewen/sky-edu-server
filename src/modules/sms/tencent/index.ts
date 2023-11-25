// 必须这么导入否则无效
import * as tencentcloud from 'tencentcloud-sdk-nodejs';

import { getSMSTemplate, Platform, SMSInput } from '../sms.utils';

const createTencentSMSClient = () => {
  // 导入对应产品模块的client models。
  const smsClient = tencentcloud.sms.v20210111.Client;

  /* 实例化要请求产品(以sms为例)的client对象 */
  const client = new smsClient({
    credential: {
      /* 必填：腾讯云账户密钥对secretId，secretKey。
       * 这里采用的是从环境变量读取的方式，需要在环境变量中先设置这两个值。
       * 您也可以直接在代码中写死密钥对，但是小心不要将代码复制、上传或者分享给他人，
       * 以免泄露密钥对危及您的财产安全。
       * SecretId、SecretKey 查询: https://console.cloud.tencent.com/cam/capi */
      secretId: process.env.TENCENT_SECRET_ID,
      secretKey: process.env.TENCENT_SECRET_KEY,
    },
    /* 必填：地域信息，可以直接填写字符串ap-guangzhou，支持的地域列表参考 https://cloud.tencent.com/document/api/382/52071#.E5.9C.B0.E5.9F.9F.E5.88.97.E8.A1.A8 */
    region: 'ap-guangzhou',
    /* 非必填:
     * 客户端配置对象，可以指定超时时间等配置 */
    profile: {
      /* SDK默认用TC3-HMAC-SHA256进行签名，非必要请不要修改这个字段 */
      signMethod: 'HmacSHA256',
      httpProfile: {
        /* SDK默认使用POST方法。
         * 如果您一定要使用GET方法，可以在这里设置。GET方法无法处理一些较大的请求 */
        reqMethod: 'POST',
        /* SDK有默认的超时时间，非必要请不要进行调整
         * 如有需要请在代码中查阅以获取最新的默认值 */
        reqTimeout: 30,
        /**
         * 指定接入地域域名，默认就近地域接入域名为 sms.tencentcloudapi.com ，也支持指定地域域名访问，例如广州地域的域名为 sms.ap-guangzhou.tencentcloudapi.com
         */
        endpoint: 'sms.tencentcloudapi.com',
      },
    },
  });

  return client;
};

/**
 * 发送腾讯云短信
 * @param params SMSInput
 * @returns
 */
export const sendTencentSMS = async (params: SMSInput): Promise<boolean> => {
  const client = createTencentSMSClient();
  /* 请求参数，根据调用的接口和实际情况，可以进一步设置请求参数
   * 属性可能是基本类型，也可能引用了另一个数据结构
   * 推荐使用IDE进行开发，可以方便的跳转查阅各个接口和数据结构的文档说明 */

  // 获取腾讯云短信模板
  const smsTemp = getSMSTemplate({
    ...params,
    platform: Platform.Tencent,
  }) as {
    SignName: string;
    TemplateId: string;
    TemplateParamSet: string[];
  };

  /* 帮助链接：
   * 短信控制台: https://console.cloud.tencent.com/smsv2
   * 腾讯云短信小助手: https://cloud.tencent.com/document/product/382/3773#.E6.8A.80.E6.9C.AF.E4.BA.A4.E6.B5.81 */
  const config = {
    /* 短信应用ID: 短信SmsSdkAppId在 [短信控制台] 添加应用后生成的实际SmsSdkAppId，示例如1400006666 */
    // 应用 ID 可前往 [短信控制台](https://console.cloud.tencent.com/smsv2/app-manage) 查看
    SmsSdkAppId: process.env.TENCENT_SMS_SDK_APP_ID,
    ...smsTemp,
    /* 下发手机号码，采用 e.164 标准，+[国家或地区码][手机号]
     * 示例如：+8613711112222， 其中前面有一个+号 ，86为国家码，13711112222为手机号，最多不要超过200个手机号*/
    PhoneNumberSet: [`+86${params.phoneNumber}`],
    /* 用户的 session 内容（无需要可忽略）: 可以携带用户侧 ID 等上下文信息，server 会原样返回 */
    SessionContext: '',
    /* 短信码号扩展号（无需要可忽略）: 默认未开通，如需开通请联系 [腾讯云短信小助手] */
    ExtendCode: '',
    /* 国内短信无需填写该项；国际/港澳台短信已申请独立 SenderId 需要填写该字段，默认使用公共 SenderId，无需填写该字段。注：月度使用量达到指定量级可申请独立 SenderId 使用，详情请联系 [腾讯云短信小助手](https://cloud.tencent.com/document/product/382/3773#.E6.8A.80.E6.9C.AF.E4.BA.A4.E6.B5.81)。 */
    SenderId: '',
  };

  try {
    // 通过client对象调用想要访问的接口，需要传入请求对象以及响应回调函数
    const res = await client.SendSms(config);
    // const res = {
    //   SendStatusSet: [
    //     {
    //       SerialNo: '3369:355200258217008135154401386',
    //       PhoneNumber: '+86xxxx',
    //       Fee: 1,
    //       SessionContext: '',
    //       Code: 'Ok',
    //       Message: 'send success',
    //       IsoCode: 'CN',
    //     },
    //   ],
    //   RequestId: 'ea8ee944-3105-4932-9d93-17f0c6990730',
    // }
    if (res?.SendStatusSet?.[0]?.Code === 'Ok') {
      return true;
    }
    console.log('【腾讯云短信发送失败1】', res);
    return false;
  } catch (error) {
    console.error('【腾讯云短信发送失败2】:', error);
    return false;
  }

  /* 当出现以下错误码时，快速解决方案参考
   * [FailedOperation.SignatureIncorrectOrUnapproved](https://cloud.tencent.com/document/product/382/9558#.E7.9F.AD.E4.BF.A1.E5.8F.91.E9.80.81.E6.8F.90.E7.A4.BA.EF.BC.9Afailedoperation.signatureincorrectorunapproved-.E5.A6.82.E4.BD.95.E5.A4.84.E7.90.86.EF.BC.9F)
   * [FailedOperation.TemplateIncorrectOrUnapproved](https://cloud.tencent.com/document/product/382/9558#.E7.9F.AD.E4.BF.A1.E5.8F.91.E9.80.81.E6.8F.90.E7.A4.BA.EF.BC.9Afailedoperation.templateincorrectorunapproved-.E5.A6.82.E4.BD.95.E5.A4.84.E7.90.86.EF.BC.9F)
   * [UnauthorizedOperation.SmsSdkAppIdVerifyFail](https://cloud.tencent.com/document/product/382/9558#.E7.9F.AD.E4.BF.A1.E5.8F.91.E9.80.81.E6.8F.90.E7.A4.BA.EF.BC.9Aunauthorizedoperation.smssdkappidverifyfail-.E5.A6.82.E4.BD.95.E5.A4.84.E7.90.86.EF.BC.9F)
   * [UnsupportedOperation.ContainDomesticAndInternationalPhoneNumber](https://cloud.tencent.com/document/product/382/9558#.E7.9F.AD.E4.BF.A1.E5.8F.91.E9.80.81.E6.8F.90.E7.A4.BA.EF.BC.9Aunsupportedoperation.containdomesticandinternationalphonenumber-.E5.A6.82.E4.BD.95.E5.A4.84.E7.90.86.EF.BC.9F)
   * 更多错误，可咨询[腾讯云助手](https://tccc.qcloud.com/web/im/index.html#/chat?webAppId=8fa15978f85cb41f7e2ea36920cb3ae1&title=Sms)
   */
};
