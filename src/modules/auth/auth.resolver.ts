import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { ResultVO } from '@/common/vo/result.vo';

import { AuthService } from './auth.service';
import {
  AdminLoginDTO,
  StudentLoginDTO,
  StudentRegisterDTO,
} from './dto/auth.dto';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => ResultVO, { description: '发送授权短信验证码' })
  async sendAuthSMS(@Args('tel') tel: string): Promise<ResultVO> {
    return await this.authService.sendAuthSMS(tel);
  }

  @Mutation(() => ResultVO, { description: '商家 PC 端登录' })
  async adminLogin(@Args('params') params: AdminLoginDTO): Promise<ResultVO> {
    return await this.authService.adminLogin(params);
  }

  @Mutation(() => ResultVO, { description: '学员 手机 端登录' })
  async studentLogin(
    @Args('params') params: StudentLoginDTO,
  ): Promise<ResultVO> {
    return await this.authService.studentLogin(params);
  }

  @Mutation(() => ResultVO, { description: '学员 手机 端注册' })
  async studentRegister(
    @Args('params') params: StudentRegisterDTO,
  ): Promise<ResultVO> {
    return await this.authService.studentRegister(params);
  }
}
