import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import {
  AUTH_CODE_ERROR,
  AUTH_CODE_EXPIRED,
  DB_ERROR,
  SUCCESS,
} from '@/common/constants/code';
import { Result } from '@/common/dto/result.type';

import { SMSService } from '../sms/sms.service';
import { User } from './models/user.entity';
import { ResetPwdInput } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly smsService: SMSService,
  ) {}

  // 新增一个用户
  async create(entity: DeepPartial<User>): Promise<User> {
    const res = await this.userRepository.save(
      await this.userRepository.create(entity),
    );
    console.log('gzw===>res', res);
    return res;
    // return res && res.raw && res.raw.affectedRows > 0;
  }

  // 删除用户
  async delete(id: string): Promise<boolean> {
    const res = await this.userRepository.delete(id);
    return res && res.affected > 0;
  }

  // 修改用户
  async update(id: string, entities: DeepPartial<User>): Promise<boolean> {
    const res = await this.userRepository.update(id, entities);
    return res && res.affected > 0;
  }

  // 通过 ID 查找用户
  async findById(id: string): Promise<User> {
    const res = await this.userRepository.findOne({ where: { id } });
    return res;
  }

  // 通过手机号查找用户
  async findByTel(tel: string): Promise<User> {
    const res = await this.userRepository.findOne({
      where: {
        tel,
      },
    });
    return res;
  }

  // resetPwd
  // PC 端登录
  async resetPwd(params: ResetPwdInput): Promise<Result> {
    const { id, tel, code, password } = params;
    const sms = await this.smsService.findSMSByTel(tel);
    // 1.验证码不存在 或 已过期
    if (!sms || !sms.code || this.smsService.isAuthSMSExpired(sms)) {
      return {
        code: AUTH_CODE_EXPIRED,
        message: '验证码已过期，请重新获取',
      };
    }
    // 2.验证码不正确
    if (code !== sms.code) {
      return {
        code: AUTH_CODE_ERROR,
        message: '验证码不正确',
      };
    }
    // 3.更新密码
    const isSuccess = await this.update(id, { password });
    if (isSuccess) {
      return {
        code: SUCCESS,
        message: '修改成功',
      };
    }

    return {
      code: DB_ERROR,
      message: '服务器忙，修改失败，请稍后再试',
    };
  }
}
