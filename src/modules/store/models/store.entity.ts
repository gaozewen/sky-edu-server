import { IsNotEmpty } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';

import { CommonEntity } from '@/common/entities/common.entity';
import { Card } from '@/modules/card/models/card.entity';
import { Course } from '@/modules/course/models/course.entity';
import { Product } from '@/modules/product/models/product.entity';
import { StoreImage } from '@/modules/store-image/models/storeImage.entity';
import { Teacher } from '@/modules/teacher/models/teacher.entity';

@Entity('store')
export class Store extends CommonEntity {
  @Column({
    comment: '营业执照',
    name: 'business_license',
  })
  @IsNotEmpty()
  businessLicense: string;

  @Column({
    comment: '法人身份证正面',
    name: 'identity_card_front_img',
  })
  @IsNotEmpty()
  identityCardFrontImg: string;

  @Column({
    comment: '法人身份证反面',
    name: 'identity_card_back_img',
  })
  @IsNotEmpty()
  identityCardBackImg: string;

  @Column({
    type: 'text',
    comment: '标签 以，隔开',
    nullable: true,
  })
  tags: string;

  @Column({
    type: 'text',
    comment: '简介',
    nullable: true,
  })
  description: string;

  @Column({
    comment: '门店名',
    nullable: true,
    default: '',
  })
  name: string;

  @Column({
    comment: 'logo',
    nullable: true,
  })
  logo: string;

  @Column({
    comment: '地址',
    nullable: true,
  })
  address: string;

  @Column({
    comment: '经度',
    nullable: true,
  })
  longitude: string;

  @Column({
    comment: '纬度',
    nullable: true,
  })
  latitude: string;

  @Column({
    comment: '电话',
    nullable: true,
  })
  tel: string;

  // () => storeImage,
  // 这个 storeImage 代表 1 对 多，多的这个实体类型
  // (storeImage) => storeImage.store,
  // 这个 storeImage.store 代表 1 对 多，在多这个实体类中，哪个字段表示 1

  @OneToMany(() => StoreImage, (storeImage) => storeImage.storeForFrontImg, {
    // eager: true,
    cascade: true,
  })
  frontImgs?: StoreImage[];

  @OneToMany(() => StoreImage, (storeImage) => storeImage.storeForRoomImg, {
    // eager: true,
    cascade: true,
  })
  roomImgs?: StoreImage[];

  @OneToMany(() => StoreImage, (storeImage) => storeImage.storeForOtherImg, {
    // eager: true,
    cascade: true,
  })
  otherImgs?: StoreImage[];

  @OneToMany(() => Course, (course) => course.store, {
    // eager: true,
    cascade: true,
  })
  courses?: Course[];

  @OneToMany(() => Card, (card) => card.store)
  cards: Card[];

  @OneToMany(() => Product, (product) => product.store)
  products: Product[];

  @OneToMany(() => Teacher, (teacher) => teacher.store)
  teachers: Teacher[];
}
