import { Field, InputType } from '@nestjs/graphql';

import { CardType } from '@/common/constants/enum';

@InputType()
export class CardDTO {
  @Field({
    description: '消费卡名称',
  })
  name: string;

  @Field({
    description: '消费卡类型 次数：time 时长：duration',
  })
  type: CardType;

  @Field({
    description: '上课次数',
    nullable: true,
  })
  time: number;

  @Field({
    description: ' 有效期（天）',
  })
  validateDay: number;
}
