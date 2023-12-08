import { Inject, UseGuards } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { WECHAT_PAY_MANAGER } from 'nest-wechatpay-node-v3';
import { v4 } from 'uuid';
import WxPay from 'wechatpay-node-v3';

import {
  PRODUCT_NOT_EXIST,
  SUCCESS,
  WX_OPENID_NOT_EXIST,
} from '@/common/constants/code';
import { JwtUserId } from '@/common/decorators/JwtUserId.decorator';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
import { ProductService } from '../product/product.service';
import { StudentService } from '../student/student.service';
import { WxPayConfigResultVO, WxPayConfigVO } from './vo/wxpay.vo';

@Resolver()
@UseGuards(JwtGqlAuthGuard)
export class WxPayResolver {
  constructor(
    @Inject(WECHAT_PAY_MANAGER) private wxPay: WxPay,
    private readonly studentService: StudentService,
    private readonly productService: ProductService,
  ) {}

  // appId: 'wx2421b1c4370ec43b', //公众号ID，由商户传入
  // timeStamp: '1395712654', //时间戳，自1970年以来的秒数
  // nonceStr: 'e61463f8efa94090b1f366cccfbbb444', //随机串
  // package: 'prepay_id=up_wx21201855730335ac86f8c43d1889123400',
  // signType: 'RSA', //微信签名方式：
  // paySign: //微信签名
  //   'oR9d8PuhnIc+YZ8cBHFCwfgpaK9gd7vaRvkYD7rthRAZ/X+QBhcCYL21N7cHCTUxbQ+EAt6Uy+lwSN22f5YZvI45MLko8Pfso0jm46v5hqcVwrk6uddkGuT+Cdvu4WBqDzaDjnNa5UK3GfE1Wfl2gHxIIY5lLdUgWFts17D4WuolLLkiFZV+JSHMvH7eaLdT9N5GBovBwu5yYKUR7skR8Fu+LozcSqQixnlEZUfyE55feLOQTUYzLmR9pNtPbPsu6WVhbNHMS3Ss2+AehHvz+n64GDmXxbX++IOBvm2olHu3PsOUGRwhudhVf7UcGcunXt8cqNjKNqZLhLw4jq/xDg==',
  @Query(() => WxPayConfigResultVO)
  async getWxPayConfig(
    @JwtUserId() id: string,
    @Args('productId') productId: string,
    @Args('amount', { type: () => Int }) amount: number, // 以分为单位
  ): Promise<WxPayConfigResultVO> {
    const student = await this.studentService.findById(id);
    const product = await this.productService.findById(productId);

    if (!product) {
      return {
        code: PRODUCT_NOT_EXIST,
        message: '商品不存在',
      };
    }

    if (!student || !student.wxOpenid) {
      return {
        code: WX_OPENID_NOT_EXIST,
        message: '微信 openid 不存在',
      };
    }

    const params = {
      description: product.name,
      out_trade_no: v4().replace(/-/g, ''),
      notify_url: '回调url',
      amount: {
        total: amount,
      },
      payer: {
        openid: student.wxOpenid,
      },
      // 可选
      // scene_info: {
      //   payer_client_ip: 'ip',
      // },
    };

    const result = await this.wxPay.transactions_jsapi(params);
    return {
      code: SUCCESS,
      data: result as WxPayConfigVO,
      message: '获取微信支付配置信息成功',
    };
  }
}
