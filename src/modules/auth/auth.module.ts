import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JWT_SECRET } from '@/common/constants/jwt';

import { SMSModule } from '../sms/sms.module';
import { UserModule } from '../user/user.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  // 由于 service 中使用到了 SMS 实体，所以需要导入，否则报错
  imports: [
    SMSModule,
    UserModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: {
        // TODO
        // jwt 过期时间
        expiresIn: '60s',
      },
    }),
  ],
  controllers: [],
  providers: [AuthService, AuthResolver, JwtStrategy],
})
export class AuthModule {}
