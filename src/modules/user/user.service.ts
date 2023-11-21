import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from './models/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 新增一个用户
  async create(entity: DeepPartial<User>): Promise<boolean> {
    const res = await this.userRepository.insert(entity);
    return res && res.raw.affectedRows > 0;
  }
}
