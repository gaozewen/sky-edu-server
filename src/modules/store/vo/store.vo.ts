import { Field, ObjectType } from '@nestjs/graphql';

import { CommonVO } from '@/common/vo/common.vo';
import { createGQLResultsVO, createGQLResultVO } from '@/common/vo/result.vo';
import { CourseVO } from '@/modules/course/vo/course.vo';
import { StoreImageVO } from '@/modules/store-image/vo/store-image.vo';

@ObjectType()
export class StoreVO extends CommonVO {
  @Field({
    description: 'logo',
    nullable: true,
  })
  logo: string;

  @Field({
    description: '门店名',
    nullable: true,
  })
  name: string;

  @Field({
    description: '标签 以，隔开',
    nullable: true,
  })
  tags: string;

  @Field({
    description: '手机号',
    nullable: true,
  })
  tel: string;

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
    description: '简介',
    nullable: true,
  })
  description: string;

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

  @Field(() => [StoreImageVO], { nullable: true, description: '封面图' })
  frontImgs?: StoreImageVO[];

  @Field(() => [StoreImageVO], { nullable: true, description: '室内图' })
  roomImgs?: StoreImageVO[];

  @Field(() => [StoreImageVO], { nullable: true, description: '其他图' })
  otherImgs?: StoreImageVO[];

  @Field(() => [CourseVO], {
    nullable: true,
    description: '当前门店的所有课程',
  })
  courses?: CourseVO[];
}

@ObjectType()
export class StoreResultVO extends createGQLResultVO(StoreVO) {}

@ObjectType()
export class StoreResultsVO extends createGQLResultsVO(StoreVO) {}
