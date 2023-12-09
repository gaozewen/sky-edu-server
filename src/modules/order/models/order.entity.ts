import { IsNotEmpty } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CommonEntity } from '@/common/entities/common.entity';
import { Product } from '@/modules/product/models/product.entity';
import { Store } from '@/modules/store/models/store.entity';
import { Student } from '@/modules/student/models/student.entity';

export enum OrderStatus {
  SUCCESS = 'SUCCESS', // 支付成功
  REFUND = 'REFUND', // 转入退款
  NOTPAY = 'NOTPAY', // 未支付
  CLOSED = 'CLOSED', // 已关闭
  REVOKED = 'REVOKED', // 已撤销（付款码支付）
  USERPAYING = 'USERPAYING', // 用户支付中（付款码支付）
  PAYERROR = 'PAYERROR', // 支付失败(其他原因，如银行返回失败)
}
/**
 * 商品订单
 */
@Entity('order')
export class Order extends CommonEntity {
  @Column({
    comment: '订单号',
    name: 'out_trade_no',
  })
  outTradeNo: string;

  @Column({
    comment: '手机号',
  })
  tel: string;

  @Column({
    comment: '购买的商品数量',
  })
  quantity: number;

  @Column({
    comment: '总金额',
  })
  amount: number;

  @Column({
    comment: ' 订单状态',
    type: 'enum',
    enum: OrderStatus,
  })
  @IsNotEmpty()
  status: OrderStatus;

  // 关联门店
  @ManyToOne(() => Store, {
    cascade: true,
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  // 关联商品
  @ManyToOne(() => Product, {
    cascade: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // 关联学生
  @ManyToOne(() => Student, {
    cascade: true,
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
