import { Field, InputType } from '@nestjs/graphql';

import { OrderStatus } from '../models/order.entity';

@InputType()
export class OrderDTO {
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
}
