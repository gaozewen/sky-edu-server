import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './models/user.entity';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/create')
  async create(): Promise<boolean> {
    return await this.userService.create({
      account: 'admin',
      password: '123456',
      username: '天空教育管理员',
      desc: '管理员',
      tel: '8800088',
    });
  }

  @Get('/delete')
  async delete(): Promise<boolean> {
    return await this.userService.delete(
      '22c32f08-02a9-48cf-a5ba-9fd581fde599',
    );
  }

  @Get('/update')
  async update(): Promise<boolean> {
    return await this.userService.update(
      'b1e2e948-f775-4aef-be86-c29a9f75835e',
      {
        account: 'admin',
        password: '123456',
        username: '天空教育管理员111',
        desc: '管理员',
        tel: '8800088',
      },
    );
  }

  @Get('/find')
  async find(): Promise<User> {
    return await this.userService.find('b1e2e948-f775-4aef-be86-c29a9f75835e');
  }
}
