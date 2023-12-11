import { IsNotEmpty } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { OrderStatus, TradeType } from '@/common/constants/enum';
import { CommonEntity } from '@/common/entities/common.entity';
import { Store } from '@/modules/store/models/store.entity';

/**
 * 微信支付订单信息
 */
@Entity('wx_order')
export class WxOrder extends CommonEntity {
  @Column({
    comment: '微信公众号 ID',
  })
  appid: string;

  @Column({
    comment: '商户号 ID',
  })
  mchid: string;

  @Column({
    comment: 'openid',
  })
  openid: string;

  @Column({
    comment: '交易类型',
    type: 'enum',
    enum: TradeType,
  })
  @IsNotEmpty()
  trade_type: TradeType;

  @Column({
    comment: '交易状态',
    type: 'enum',
    enum: OrderStatus,
    enumName: '交易状态',
  })
  @IsNotEmpty()
  trade_state: OrderStatus;

  @Column({
    comment: '银行',
    nullable: true,
  })
  bank_type: string;

  @Column({
    comment: '微信支付订单号',
  })
  transaction_id: string;

  @Column({
    comment: '商户订单号',
  })
  out_trade_no: string;

  @Column({
    comment: '附加数据',
    nullable: true,
  })
  attach: string;

  @Column({
    comment: '交易状态描述',
    nullable: true,
  })
  trade_state_desc: string;

  @Column({
    comment: '支付完成时间',
    nullable: true,
  })
  success_time: string;

  @Column({
    comment: '订单总金额，单位为分',
  })
  total: number;

  @Column({
    comment: '用户支付金额，单位为分',
  })
  payer_total: number;

  @Column({
    comment: 'CNY:人民币，境内商户号仅支持人民币',
    nullable: true,
  })
  currency: string;

  @Column({
    comment: '用户支付币种，示例值：CNY',
    nullable: true,
  })
  payer_currency: string;

  // 关联门店
  @ManyToOne(() => Store, {
    cascade: true,
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
