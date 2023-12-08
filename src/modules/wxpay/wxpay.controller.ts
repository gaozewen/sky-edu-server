import { Controller, Get, Query, Res } from '@nestjs/common';
import axios from 'axios';

import { StudentService } from '../student/student.service';
/**
 * sky-edu-server.gaozewen.com/wx/xxx
 * https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html
 */
@Controller('wx')
export class WxpayController {
  constructor(private readonly studentService: StudentService) {}

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
}
