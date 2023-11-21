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
    return res && res.raw && res.raw.affectedRows > 0;
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

  // 查询用户
  async find(id: string): Promise<User> {
    const res = await this.userRepository.findOne({ where: { id } });
    return res;
  }
}
