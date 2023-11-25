import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SMS } from './models/sms.entity';
import { SMSService } from './sms.service';

@Module({
  imports: [TypeOrmModule.forFeature([SMS])],
  controllers: [],
  providers: [SMSService],
  exports: [SMSService],
})
export class SMSModule {}
