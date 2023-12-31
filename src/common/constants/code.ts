// response 状态码
// 成功
export const SUCCESS = 200;
// 获取验证码失败
export const GET_AUTH_CODE_FAILED = 10001;
// 验证码获取过于频繁
export const GET_SMS_FREQUENTLY = 10002;
// 验证码已过期
export const AUTH_CODE_EXPIRED = 10003;
// 验证码不正确
export const AUTH_CODE_ERROR = 10004;
// 数据库操作失败
export const DB_ERROR = 10005;
// 账户不存在
export const ACCOUNT_NOT_EXIST = 10006;
// 参数必传错误
export const PARAMS_REQUIRED_ERROR = 10007;
// 密码错误
export const PASSWORD_ERROR = 10008;
// 门店信息不存在
export const STORE_NOT_EXIST = 10009;
// 账户已在
export const ACCOUNT_EXIST = 10010;
// 课程信息不存在
export const COURSE_NOT_EXIST = 10011;
// 消费卡信息不存在
export const CARD_NOT_EXIST = 10012;
// 商品信息不存在
export const PRODUCT_NOT_EXIST = 10013;
// 微信 openid 不存在
export const WX_OPENID_NOT_EXIST = 10014;
// 订单信息不存在
export const ORDER_NOT_EXIST = 10015;
//  微信订单信息不存在
export const WX_ORDER_NOT_EXIST = 10016;
// 教师信息不存在
export const TEACHER_NOT_EXIST = 10017;
// 课程表信息不存在
export const SCHEDULE_NOT_EXIST = 10018;
// 消费卡记录信息不存在
export const CARD_RECORD_NOT_EXIST = 10019;
// 没库存了
export const OUT_OF_STOCK = 10020;
// 消费卡已过期
export const CARD_EXPIRED = 10021;
// 消费卡次数已耗尽
export const CARD_DEPLETED = 10022;
// 课程表记录信息不存在
export const SCHEDULE_RECORD_NOT_EXIST = 10023;
// 预约失败
export const ORDER_FAIL = 10024;
// 取消预约失败
export const CANCEL_ORDER_COURSE_FAIL = 10025;
// 可约时间不存在
export const WEEKLY_ORDER_TIMES_NOT_EXIST = 10026;
// 不存在有效的排课
export const VALID_SCHEDULE_NOT_EXIST = 10027;
// 消费卡存在对应的消费卡记录
export const CARD_RECORD_EXIST = 10028;
