import { Field, ObjectType } from '@nestjs/graphql';

import { BaseVO } from '@/common/vo/base.vo';
import { createGQLResultsVO, createGQLResultVO } from '@/common/vo/result.vo';
import { StoreImageVO } from '@/modules/storeImage/vo/storeImage.vo';

@ObjectType()
export class StoreVO extends BaseVO {
  @Field({
    description: '营业执照',
  })
  businessLicense: string;

  @Field({
    description: '法人身份证正面',
  })
  identityCardFrontImg: string;

  @Field({
    description: '法人身份证反面',
  })
  identityCardBackImg: string;

  @Field({
    description: '标签 以，隔开',
    nullable: true,
  })
  tags: string;

  @Field({
    description: '简介',
    nullable: true,
  })
  description: string;

  @Field({
    description: '门店名',
    nullable: true,
  })
  name: string;

  @Field({
    description: 'logo',
    nullable: true,
  })
  logo: string;

  @Field({
    description: '经度',
    nullable: true,
  })
  longitude: string;

  @Field({
    description: '纬度',
    nullable: true,
  })
  latitude: string;

  @Field({
    description: '地址',
    nullable: true,
  })
  address?: string;

  @Field({
    description: '电话',
    nullable: true,
  })
  tel: string;

  @Field(() => [StoreImageVO], { nullable: true, description: '封面图' })
  frontImg?: StoreImageVO[];

  @Field(() => [StoreImageVO], { nullable: true, description: '室内图' })
  roomImg?: StoreImageVO[];

  @Field(() => [StoreImageVO], { nullable: true, description: '其他图' })
  otherImg?: StoreImageVO[];
}

@ObjectType()
export class StoreResultVO extends createGQLResultVO(StoreVO) {}

@ObjectType()
export class StoreResultsVO extends createGQLResultsVO(StoreVO) {}
