import { Injectable } from '@nestjs/common';
import {
  ACCOUNT_NOT_EXIST,
  AUTH_CODE_ERROR,
  AUTH_CODE_EXPIRED,
  AUTH_CODE_NOT_EXPIRED,
  DB_ERROR,
  GET_AUTH_CODE_FAILED,
  PARAMS_REQUIRED_ERROR,
  PASSWORD_ERROR,
  SUCCESS,
} from 'src/common/constants/code';

import { Result } from '@/common/dto/result.type';

import { SMSService } from '../sms/sms.service';
import { User } from '../user/models/user.entity';
import { UserService } from '../user/user.service';
import { AdminLoginInput } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly smsService: SMSService,
    private readonly userService: UserService,
  ) {}

  // 发送授权短信验证码
  async sendAuthSMS(tel: string): Promise<Result> {
    const sms = await this.smsService.findSMSByTel(tel);
    if (sms) {
      if (!this.smsService.isAuthSMSExpired(sms)) {
        // 未过期，直接返回提示
        return {
          code: AUTH_CODE_NOT_EXPIRED,
          message: '验证码尚未过期',
        };
      }
      // 已过期,删除验证码
      await this.smsService.delete(tel);
    }

    const genRandomCode = () => {
      const code = [];
      for (let i = 0; i < 4; i++) {
        code.push(Math.floor(Math.random() * 9));
      }
      return code.join('');
    };

    // 生成验证码
    const code = genRandomCode();
    // 是否发送成功
    const isSuccess = await this.smsService.sendAuthSMS(tel, code);
    if (isSuccess) {
      return {
        code: SUCCESS,
        message: '获取验证码成功',
      };
    }

    return {
      code: GET_AUTH_CODE_FAILED,
      message: '获取验证码失败',
    };
  }

  // PC 验证码登录/注册
  private async adminCodeLogin(
    params: AdminLoginInput,
    user: User,
  ): Promise<Result> {
    const { tel, code } = params;

    // 0.手机号或验证码未输入
    if (!tel || !code) {
      return {
        code: PARAMS_REQUIRED_ERROR,
        message: !tel ? '请输入手机号' : '请输入验证码',
      };
    }

    const sms = await this.smsService.findSMSByTel(tel);

    // 1.验证码不存在 或 已过期
    if (!sms || !sms.code || this.smsService.isAuthSMSExpired(sms)) {
      return {
        code: AUTH_CODE_EXPIRED,
        message: '登录失败，验证码已过期，请重新获取',
      };
    }
    // 2.验证码不正确
    if (code !== sms.code) {
      return {
        code: AUTH_CODE_ERROR,
        message: '登录失败，验证码不正确',
      };
    }
    // 3.用户不存在
    if (!user) {
      // 3.1 创建用户
      const isSuccess = await this.userService.create({
        account: tel,
        tel,
      });
      // 3.2 创建成功
      if (isSuccess) {
        return {
          code: SUCCESS,
          message: '登录成功',
        };
      }
      // 3.3 创建失败
      return {
        code: DB_ERROR,
        message: '登录失败',
      };
    }
    // 4.用户存在
    return {
      code: SUCCESS,
      message: '登录成功',
    };
  }

  // PC 手机号密码登录
  private async adminPwdLogin(
    params: AdminLoginInput,
    user: User,
  ): Promise<Result> {
    const { tel, password } = params;

    // 0.手机号或密码未输入
    if (!tel || !password) {
      return {
        code: PARAMS_REQUIRED_ERROR,
        message: '请输入手机号和密码',
      };
    }

    // 1.账户不存在
    if (!user) {
      return {
        code: ACCOUNT_NOT_EXIST,
        message: '账户不存在，请先注册',
      };
    }

    // 2.账户存在
    // 2.1 密码错误
    if (password.trim() !== user.password) {
      return {
        code: PASSWORD_ERROR,
        message: '登录失败，密码错误',
      };
    }
    // 2.2 密码正确
    return {
      code: SUCCESS,
      message: '登录成功',
    };
  }

  // PC 端登录
  async adminLogin(params: AdminLoginInput): Promise<Result> {
    const { loginType, tel } = params;
    if (!loginType) {
      return {
        code: PARAMS_REQUIRED_ERROR,
        message: '登录失败，登录类型丢失',
      };
    }

    const user = await this.userService.findByTel(tel);
    // 验证码登录
    if (loginType === 'mobile') {
      return await this.adminCodeLogin(params, user);
    }
    // 账号密码登录
    return await this.adminPwdLogin(params, user);
  }
}
