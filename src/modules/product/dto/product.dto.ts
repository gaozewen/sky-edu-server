import { Field, InputType, PartialType } from '@nestjs/graphql';

import { ProductStatus } from '@/common/constants/enum';

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
    description: '商品品类',
    nullable: true,
  })
  category: string;

  @Field({
    description: '上下架状态',
  })
  status: ProductStatus;

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

  @Field(() => [String], {
    description: '商品绑定的消费卡',
    nullable: true,
  })
  cardIds: string[];
}

@InputType()
export class PartialProductDTO extends PartialType(ProductDTO) {}
