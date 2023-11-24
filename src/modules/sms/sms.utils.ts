export enum Platform {
  Aliyun = 'Aliyun',
  Tencent = 'Tencent',
}
export enum TempType {
  // 授权码
  AUTH = 'AUTH',
  // 修改密码
  FORGET_PWD = 'FORGET_PWD',
}
type TempParamsObj = {
  [Platform.Aliyun]: { [key: string]: any };
  [Platform.Tencent]: string[];
};

export type SMSInput = {
  // 平台：阿里云/腾讯云等
  platform?: Platform;
  // 短信模板类型
  tempType: TempType;
  // 短信模板参数
  templateParams: TempParamsObj;
  // 手机号码
  phoneNumber?: string;
};

const SIGN_NAME = {
  SKY_EDU: '天空教育',
  GZW_HOME_PAGE: '高泽文的个人主页',
};

// 阿里云的短信模板 ID
const TEMP_ALIYUN = {
  [TempType.AUTH]: 'SMS_291560244',
  // TODO:
  [TempType.FORGET_PWD]: 'xxx',
};

// TODO:
// 腾讯云的短信模板 ID
const TEMP_TENCENT = {
  [TempType.AUTH]: 'xxx',
  [TempType.FORGET_PWD]: 'xxxxx',
};

const isTempParamsObj = (
  params: any[] | TempParamsObj,
): params is TempParamsObj => {
  return typeof params === 'object' && !Array.isArray(params);
};

/**
 * 获取短信服务模板参数
 */
export const getSMSTemplate = (params: SMSInput) => {
  const { platform, tempType, templateParams } = params;
  if (platform === Platform.Aliyun && isTempParamsObj(templateParams)) {
    return {
      signName: SIGN_NAME.SKY_EDU,
      templateCode: TEMP_ALIYUN[tempType],
      templateParam: JSON.stringify(templateParams[Platform.Aliyun]),
    };
  }

  if (platform === Platform.Tencent && Array.isArray(templateParams)) {
    return {
      /* 短信签名内容: 使用 UTF-8 编码，必须填写已审核通过的签名 */
      // 签名信息可前往 [国内短信](https://console.cloud.tencent.com/smsv2/csms-sign) 或 [国际/港澳台短信](https://console.cloud.tencent.com/smsv2/isms-sign) 的签名管理查看
      SignName: SIGN_NAME.GZW_HOME_PAGE,
      /* 模板 ID: 必须填写已审核通过的模板 ID */
      // 模板 ID 可前往 [国内短信](https://console.cloud.tencent.com/smsv2/csms-template) 或 [国际/港澳台短信](https://console.cloud.tencent.com/smsv2/isms-template) 的正文模板管理查看
      TemplateId: TEMP_TENCENT[tempType],
      /* 模板参数: 模板参数的个数需要与 TemplateId 对应模板的变量个数保持一致，若无模板参数，则设置为空 */
      TemplateParamSet: templateParams[Platform.Tencent],
    };
  }

  return {};
};
