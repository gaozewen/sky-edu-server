import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Result } from 'src/common/dto/result.type';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Result, { description: '发送授权短信验证码' })
  async sendAuthSMS(@Args('phoneNumber') phoneNumber: string): Promise<Result> {
    return await this.authService.sendAuthSMS(phoneNumber);
  }
}
