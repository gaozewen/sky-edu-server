import { ConsoleLogger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SMSModule } from '../sms/sms.module';
import { User } from './models/user.entity';
import { UserController } from './user.controller';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), SMSModule],
  controllers: [UserController],
  providers: [UserService, ConsoleLogger, UserResolver],
  exports: [UserService],
})
export class UserModule {}
