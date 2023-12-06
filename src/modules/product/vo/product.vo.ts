import { Field, ObjectType } from '@nestjs/graphql';

import { CommonVO } from '@/common/vo/common.vo';
import { createGQLResultsVO, createGQLResultVO } from '@/common/vo/result.vo';
import { StoreVO } from '@/modules/store/vo/store.vo';

@ObjectType()
export class ProductVO extends CommonVO {
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
    description: '当前库存',
    nullable: true,
  })
  curStock: number;

  @Field({
    description: '已售数量',
    nullable: true,
  })
  sellNumber: number;

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

  @Field(() => StoreVO, {
    description: '门店',
  })
  store: StoreVO;
}

@ObjectType()
export class ProductResultVO extends createGQLResultVO(ProductVO) {}

@ObjectType()
export class ProductResultsVO extends createGQLResultsVO(ProductVO) {}
