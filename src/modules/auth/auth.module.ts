import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SMS } from '../sms/models/sms.entity';
import { SMSService } from '../sms/sms.service';
import { User } from '../user/models/user.entity';
import { UserService } from '../user/user.service';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

@Module({
  // 由于 service 中使用到了 SMS 实体，所以需要导入，否则报错
  imports: [TypeOrmModule.forFeature([SMS, User])],
  controllers: [],
  providers: [AuthService, AuthResolver, SMSService, UserService],
})
export class AuthModule {}
