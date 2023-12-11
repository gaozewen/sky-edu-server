import { IsNotEmpty, Min } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';

import { ProductStatus } from '@/common/constants/enum';
import { CommonEntity } from '@/common/entities/common.entity';
import { Card } from '@/modules/card/models/card.entity';
import { Store } from '@/modules/store/models/store.entity';

/**
 * 商品
 */
@Entity('product')
export class Product extends CommonEntity {
  @Column({
    comment: '商品名称',
  })
  @IsNotEmpty()
  name: string;

  @Column({
    comment: '描述',
    nullable: true,
  })
  desc: string;

  @Column({
    comment: '商品品类',
    nullable: true,
  })
  category: string;

  @Column({
    comment: '上下架状态',
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.UN_LIST,
  })
  @IsNotEmpty()
  status: ProductStatus;

  @Column({
    comment: '库存总数',
    default: 0,
    type: 'int',
  })
  stock: number;

  @Column({
    comment: '当前库存',
    default: 0,
    name: 'cur_stock',
    type: 'int',
  })
  curStock: number;

  @Column({
    comment: '已售数量',
    default: 0,
    name: 'sell_number',
    type: 'int',
  })
  sellNumber: number;

  @Column({
    comment: '每人限购数量',
    default: -1, // -1 不限购
    name: 'limit_buy_number',
    type: 'int',
  })
  limitBuyNumber: number;

  @Column({
    comment: '商品封面图',
    name: 'cover_url',
  })
  coverUrl: string;

  @Column({
    comment: '商品 Banner 图',
    name: 'banner_url',
  })
  bannerUrl: string;

  @Column({
    comment: '原价',
    name: 'original_price',
    type: 'float',
  })
  @IsNotEmpty()
  @Min(0.01)
  originalPrice: number;

  @Column({
    comment: '优惠价',
    name: 'preferential_price',
    type: 'float',
  })
  @IsNotEmpty()
  @Min(0.01)
  preferentialPrice: number;

  // 关联门店
  @ManyToOne(() => Store, (store) => store.products, {
    cascade: true,
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  // 商品绑定的消费卡
  @ManyToMany(() => Card, {
    cascade: true,
  })
  @JoinTable({
    name: 'product_card',
    joinColumns: [{ name: 'product_id' }],
    inverseJoinColumns: [{ name: 'card_id' }],
  })
  cards: Card[];
}
