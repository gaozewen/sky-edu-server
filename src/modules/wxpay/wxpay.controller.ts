import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import axios from 'axios';
import { WECHAT_PAY_MANAGER } from 'nest-wechatpay-node-v3';
import WxPay from 'wechatpay-node-v3';

import { OrderStatus } from '../order/models/order.entity';
import { OrderService } from '../order/order.service';
import { StudentService } from '../student/student.service';
import { IWxPayResultDTO } from './dto/wx.dto';
/**
 * sky-edu-server.gaozewen.com/wx/xxx
 * https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html
 */
@Controller('wx')
export class WxpayController {
  constructor(
    @Inject(WECHAT_PAY_MANAGER) private wxPay: WxPay,
    private readonly studentService: StudentService,
    private readonly orderService: OrderService,
  ) {}

  // /wx/login
  @Get('login')
  async wxLogin(
    @Query('userId') userId: string,
    @Query('url') url: string,
    @Res() res,
  ): Promise<void> {
    res.redirect(
      `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${
        process.env.WXPAY_APPID
      }&redirect_uri=${
        process.env.SKY_EDU_SERVER_URL
      }/wx/code&response_type=code&scope=snsapi_base&state=${userId}@${encodeURIComponent(
        url,
      )}#wechat_redirect`,
    );
  }

  // /wx/code
  // 获取微信返回的 code，然后用 code 调用 access_token 接口获取 openid
  @Get('code')
  async wxCode(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res,
  ) {
    const [userId, url] = state.split('@');
    const response = await axios.get(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.WXPAY_APPID}&secret=${process.env.WXPAY_APPSECRET}&code=${code}&grant_type=authorization_code`,
    );
    const { openid } = response.data;
    await this.studentService.updateById(userId, {
      wxOpenid: openid,
    });
    // 跳回购买信息页
    res.redirect(decodeURIComponent(url));
  }

  // 微信支付结果通知回调接口
  // https://pay.weixin.qq.com/docs/partner/apis/partner-jsapi-payment/payment-notice.html
  @Post('payResult')
  async wxPayResult(@Body() data: IWxPayResultDTO) {
    const { resource } = data;
    const { ciphertext, associated_data, nonce } = resource;
    const result: {
      out_trade_no: string;
      trade_state: string;
    } = this.wxPay.decipher_gcm(
      ciphertext,
      associated_data,
      nonce,
      process.env.WXPAY_APIV3_KEY,
    );
    const order = await this.orderService.findByOutTradeNo(result.out_trade_no);
    // 目前只考虑支付中和支付成功两个状态
    if (order && order.status === OrderStatus.USERPAYING) {
      // 更新项目自己的订单状态
      await this.orderService.updateById(order.id, {
        status: result.trade_state as OrderStatus,
        // TODO: 关联微信支付订单
      });
    }

    return {
      code: 'SUCCESS',
      message: '成功',
    };
  }
}
