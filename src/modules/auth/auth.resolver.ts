import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Result } from 'src/common/dto/result.type';
import { AdminLoginInput } from './auth.dto';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Result, { description: '发送授权短信验证码' })
  async sendAuthSMS(@Args('tel') tel: string): Promise<Result> {
    return await this.authService.sendAuthSMS(tel);
  }

  @Mutation(() => Result, { description: 'PC 端登录' })
  async adminLogin(@Args('params') params: AdminLoginInput): Promise<Result> {
    return await this.authService.adminLogin(params);
  }
}
