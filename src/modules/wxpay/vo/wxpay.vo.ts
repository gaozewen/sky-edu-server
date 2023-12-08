import { Field, ObjectType } from '@nestjs/graphql';

import { createGQLResultVO } from '@/common/vo/result.vo';

// appId: 'wx2421b1c4370ec43b', //公众号ID，由商户传入
// timeStamp: '1395712654', //时间戳，自1970年以来的秒数
// nonceStr: 'e61463f8efa94090b1f366cccfbbb444', //随机串
// package: 'prepay_id=up_wx21201855730335ac86f8c43d1889123400',
// signType: 'RSA', //微信签名方式：
// paySign: //微信签名
//   'oR9d8PuhnIc+YZ8cBHFCwfgpaK9gd7vaRvkYD7rthRAZ/X+QBhcCYL21N7cHCTUxbQ+EAt6Uy+lwSN22f5YZvI45MLko8Pfso0jm46v5hqcVwrk6uddkGuT+Cdvu4WBqDzaDjnNa5UK3GfE1Wfl2gHxIIY5lLdUgWFts17D4WuolLLkiFZV+JSHMvH7eaLdT9N5GBovBwu5yYKUR7skR8Fu+LozcSqQixnlEZUfyE55feLOQTUYzLmR9pNtPbPsu6WVhbNHMS3Ss2+AehHvz+n64GDmXxbX++IOBvm2olHu3PsOUGRwhudhVf7UcGcunXt8cqNjKNqZLhLw4jq/xDg==',
@ObjectType()
export class WxPayConfigVO {
  @Field({
    description: '公众号 ID',
  })
  appId: string;

  @Field({
    description: '时间戳，自1970年以来的秒数',
  })
  timeStamp: string;

  @Field({
    description: '随机串',
  })
  nonceStr: string;

  @Field({
    description: '参数包',
  })
  package: string;

  @Field({
    description: '微信签名方式',
  })
  signType: string;

  @Field({
    description: '微信签名',
  })
  paySign: string;
}

@ObjectType()
export class WxPayConfigResultVO extends createGQLResultVO(WxPayConfigVO) {}
