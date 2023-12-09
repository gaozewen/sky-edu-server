import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WxOrder } from './models/wx-order.entity';
import { WxOrderResolver } from './wx-order.resolver';
import { WxOrderService } from './wx-order.service';

@Module({
  imports: [TypeOrmModule.forFeature([WxOrder])],
  providers: [WxOrderService, WxOrderResolver],
  exports: [WxOrderService],
})
export class WxOrderModule {}
