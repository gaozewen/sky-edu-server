import { Field, InputType } from '@nestjs/graphql';

import { StoreImageDTO } from '@/modules/store-image/dto/store-image.dto';

@InputType()
export class StoreDTO {
  @Field({
    description: '名称',
  })
  name: string;

  @Field({
    description: 'logo',
  })
  logo: string;

  @Field({
    description: '手机号',
    nullable: true,
  })
  tel: string;

  @Field({
    description: 'tags',
    nullable: true,
  })
  tags: string;

  @Field({
    description: 'longitude',
    nullable: true,
  })
  longitude: string;

  @Field({
    description: 'latitude',
    nullable: true,
  })
  latitude: string;

  @Field({
    description: 'latitude',
    nullable: true,
  })
  address: string;

  @Field({
    description: '营业执照',
  })
  businessLicense: string;

  @Field({
    description: 'description',
  })
  description: string;

  @Field({
    description: '法人身份证正面',
  })
  identityCardFrontImg: string;

  @Field({
    description: '法人身份证反面',
  })
  identityCardBackImg: string;

  @Field(() => [StoreImageDTO], {
    nullable: true,
    description: '门店门面照片',
  })
  frontImgs?: StoreImageDTO[];

  @Field(() => [StoreImageDTO], {
    nullable: true,
    description: '门店环境照片',
  })
  roomImgs?: StoreImageDTO[];

  @Field(() => [StoreImageDTO], {
    nullable: true,
    description: '门店环境照片',
  })
  otherImgs?: StoreImageDTO[];
}
