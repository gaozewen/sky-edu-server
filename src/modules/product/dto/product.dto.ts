import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ProductDTO {
  @Field({
    description: '商品名称',
  })
  name: string;

  @Field({
    description: '描述',
    nullable: true,
  })
  desc: string;

  @Field({
    description: '库存总数',
    nullable: true,
  })
  stock: number;

  @Field({
    description: '每人限购数量',
    nullable: true,
  })
  limitBuyNumber: number;

  @Field({
    description: '商品封面图',
  })
  coverUrl: string;

  @Field({
    description: '商品 Banner 图',
  })
  bannerUrl: string;

  @Field({
    description: '原价',
    nullable: true,
  })
  originalPrice: number;

  @Field({
    description: '优惠价',
    nullable: true,
  })
  preferentialPrice: number;
}
