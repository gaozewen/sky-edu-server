import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { SMSService } from '../sms/sms.service';
import { User } from './models/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly smsService: SMSService,
  ) {}

  // 新增一个用户
  async create(entity: DeepPartial<User>): Promise<User> {
    const createdUser = await this.userRepository.save(
      await this.userRepository.create(entity),
    );
    return createdUser;
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
    return await this.userRepository.findOne({
      where: { id },
    });
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
}
