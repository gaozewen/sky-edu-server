import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ACCOUNT_EXIST,
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

import { ResultVO } from '@/common/vo/result.vo';

import { SMSService } from '../sms/sms.service';
import { Student } from '../student/models/student.entity';
import { StudentService } from '../student/student.service';
import { User } from '../user/models/user.entity';
import { UserService } from '../user/user.service';
import {
  AdminLoginDTO,
  StudentLoginDTO,
  StudentRegisterDTO,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly smsService: SMSService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly studentService: StudentService,
  ) {}

  // 发送授权短信验证码
  async sendAuthSMS(tel: string): Promise<ResultVO> {
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

  // JWT 签名
  private genJwtToken(user: User | Student) {
    const token = this.jwtService.sign(
      {
        id: user.id,
      },
      {
        secret: process.env.JWT_SECRET,
        // https://github.com/vercel/ms
        expiresIn: '7 days', // 生产环境
        // TODO:
        // expiresIn: '10s', // 测试环境
      },
    );
    return token;
  }

  // PC 验证码登录/注册
  private async adminCodeLogin(
    params: AdminLoginDTO,
    user: User,
  ): Promise<ResultVO> {
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
      const createdUser = await this.userService.create({
        account: tel,
        tel,
      });
      // 3.2 创建成功
      if (createdUser) {
        return {
          code: SUCCESS,
          message: '登录成功',
          data: this.genJwtToken(createdUser),
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
      data: this.genJwtToken(user),
    };
  }

  // PC 手机号密码登录
  private async adminPwdLogin(
    params: AdminLoginDTO,
    user: User,
  ): Promise<ResultVO> {
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
    if (password !== user.password) {
      return {
        code: PASSWORD_ERROR,
        message: '登录失败，密码错误',
      };
    }
    // 2.2 密码正确
    return {
      code: SUCCESS,
      message: '登录成功',
      data: this.genJwtToken(user),
    };
  }

  // PC 端登录
  async adminLogin(params: AdminLoginDTO): Promise<ResultVO> {
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

  // 学员 手机端 账号密码登录
  private async studentPwdLogin(
    params: StudentLoginDTO,
    student: Student,
  ): Promise<ResultVO> {
    const { password } = params;

    // 1.账户不存在
    if (!student) {
      return {
        code: ACCOUNT_NOT_EXIST,
        message: '账户不存在，请先注册',
      };
    }

    // 2.账户存在
    // 2.1 密码错误
    if (password !== student.password) {
      return {
        code: PASSWORD_ERROR,
        message: '登录失败，密码错误',
      };
    }
    // 2.2 密码正确
    return {
      code: SUCCESS,
      message: '登录成功',
      data: this.genJwtToken(student),
    };
  }

  // 学员 手机端 端登录
  async studentLogin(params: StudentLoginDTO): Promise<ResultVO> {
    const { account } = params;
    const student = await this.studentService.findByAccount(account);

    // 账号密码登录
    return await this.studentPwdLogin(params, student);
  }

  // 学员 手机端 端注册
  private async studentAccountRegister(
    params: StudentRegisterDTO,
    student: Student,
  ): Promise<ResultVO> {
    const { account, password } = params;
    // 1.用户存在
    if (student) {
      return {
        code: ACCOUNT_EXIST,
        message: '账号已被注册，请使用其他账号',
      };
    }
    // 2.用户不存在
    // 2.1 创建学生账户
    const createdStudent = await this.studentService.create({
      account,
      password,
    });
    // 2.2 创建成功
    if (createdStudent) {
      return {
        code: SUCCESS,
        message: '注册成功',
        data: this.genJwtToken(createdStudent),
      };
    }
    // 2.3 创建失败
    return {
      code: DB_ERROR,
      message: '注册失败',
    };
  }

  // 学员 手机端 端注册
  async studentRegister(params: StudentRegisterDTO): Promise<ResultVO> {
    const { account } = params;
    const student = await this.studentService.findByAccount(account);

    // 账号密码登录
    return await this.studentAccountRegister(params, student);
  }
}
