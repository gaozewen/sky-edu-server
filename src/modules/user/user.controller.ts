import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/create')
  async create(): Promise<boolean> {
    return await this.userService.create({
      account: 'admin',
      password: '123456',
      name: '天空教育管理员',
      desc: '管理员',
      tel: '8800088',
    });
  }
}
