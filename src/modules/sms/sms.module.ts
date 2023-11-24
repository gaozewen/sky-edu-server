import { Module } from '@nestjs/common';
import { SMSService } from './sms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SMS } from './models/sms.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SMS])],
  controllers: [],
  providers: [SMSService],
  exports: [SMSService],
})
export class SMSModule {}
