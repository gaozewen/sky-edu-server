import { Field, ObjectType } from '@nestjs/graphql';

import { OrderStatus, TradeType } from '@/common/constants/enum';
import { CommonVO } from '@/common/vo/common.vo';
import { createGQLResultsVO, createGQLResultVO } from '@/common/vo/result.vo';
import { StoreVO } from '@/modules/store/vo/store.vo';

@ObjectType()
export class WxOrderVO extends CommonVO {
  @Field({
    description: '微信公众号 ID',
  })
  appid: string;

  @Field({
    description: '商户号 ID',
  })
  mchid: string;

  @Field({
    description: 'openid',
  })
  openid: string;

  @Field({
    description: '交易类型',
  })
  trade_type: TradeType;

  @Field({
    description: '交易状态',
  })
  trade_state: OrderStatus;

  @Field({
    description: '银行',
    nullable: true,
  })
  bank_type: string;

  @Field({
    description: '微信支付订单号',
  })
  transaction_id: string;

  @Field({
    description: '商户订单号',
  })
  out_trade_no: string;

  @Field({
    description: '附加数据',
    nullable: true,
  })
  attach: string;

  @Field({
    description: '交易状态描述',
    nullable: true,
  })
  trade_state_desc: string;

  @Field({
    description: '支付完成时间',
    nullable: true,
  })
  success_time: string;

  @Field({
    description: '订单总金额，单位为分',
  })
  total: number;

  @Field({
    description: '用户支付金额，单位为分',
  })
  payer_total: number;

  @Field({
    description: 'CNY:人民币，境内商户号仅支持人民币',
    nullable: true,
  })
  currency: string;

  @Field({
    description: '用户支付币种，示例值：CNY',
    nullable: true,
  })
  payer_currency: string;

  @Field(() => StoreVO, {
    description: '门店',
  })
  store: StoreVO;
}

@ObjectType()
export class WxOrderResultVO extends createGQLResultVO(WxOrderVO) {}

@ObjectType()
export class WxOrderResultsVO extends createGQLResultsVO(WxOrderVO) {}
