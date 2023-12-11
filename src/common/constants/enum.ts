// 短信平台
export enum Platform {
  Aliyun = 'Aliyun',
  Tencent = 'Tencent',
}

// 短信模板类型
export enum TempType {
  // 授权码
  AUTH = 'AUTH',
  // 修改密码
  FORGET_PWD = 'FORGET_PWD',
}

// 订单状态
export enum OrderStatus {
  SUCCESS = 'SUCCESS', // 支付成功
  REFUND = 'REFUND', // 转入退款
  NOTPAY = 'NOTPAY', // 未支付
  CLOSED = 'CLOSED', // 已关闭
  REVOKED = 'REVOKED', // 已撤销（付款码支付）
  USERPAYING = 'USERPAYING', // 用户支付中（付款码支付）
  PAYERROR = 'PAYERROR', // 支付失败(其他原因，如银行返回失败)
}

// 微信支付类型
export enum TradeType {
  JSAPI = 'JSAPI', // 公众号支付
  NATIVE = 'NATIVE', // 扫码支付
  App = 'App', // App支付
  MICROPAY = 'MICROPAY', // 付款码支付
  MWEB = 'MWEB', // H5支付
  FACEPAY = 'FACEPAY', // 刷脸支付
}

// 商品状态
export enum ProductStatus {
  LIST = 'list', // 上架
  UN_LIST = 'un_list', // 下架
}

// 消费卡类型
export enum CardType {
  TIME = 'time',
  DURATION = 'duration',
}

// 学生购买的消费卡记录状态
export enum CardRecordStatus {
  VALID = 'VALID', // 有效
  EXPIRED = 'EXPIRED', // 过期
  DEPLETED = 'DEPLETED', // 耗尽
}
