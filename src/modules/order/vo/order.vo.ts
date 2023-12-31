import { Field, ObjectType } from '@nestjs/graphql';

import { OrderStatus } from '@/common/constants/enum';
import { CommonVO } from '@/common/vo/common.vo';
import { createGQLResultsVO, createGQLResultVO } from '@/common/vo/result.vo';
import { ProductVO } from '@/modules/product/vo/product.vo';
import { StoreVO } from '@/modules/store/vo/store.vo';
import { StudentVO } from '@/modules/student/vo/student.vo';
import { WxOrderVO } from '@/modules/wx-order/vo/wx-order.vo';

@ObjectType()
export class OrderVO extends CommonVO {
  @Field({
    description: '订单号',
  })
  outTradeNo: string;

  @Field({
    description: '手机号',
  })
  tel: string;

  @Field({
    description: '购买的商品数量',
  })
  quantity: number;

  @Field({
    description: '总金额',
  })
  amount: number;

  @Field({
    description: '订单状态 ',
  })
  status: OrderStatus;

  @Field(() => StoreVO, {
    description: '门店',
  })
  store: StoreVO;

  @Field(() => ProductVO, {
    description: '商品',
  })
  product: ProductVO;

  @Field(() => StudentVO, {
    description: '购买学员',
  })
  student: StudentVO;

  @Field(() => WxOrderVO, {
    description: '对应的微信支付订单信息',
  })
  wxOrder: WxOrderVO;
}

@ObjectType()
export class OrderResultVO extends createGQLResultVO(OrderVO) {}

@ObjectType()
export class OrderResultsVO extends createGQLResultsVO(OrderVO) {}
