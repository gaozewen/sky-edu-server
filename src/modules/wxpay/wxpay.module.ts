import { Module } from '@nestjs/common';
import * as fs from 'fs';
import { WeChatPayModule } from 'nest-wechatpay-node-v3';

import { CardRecordModule } from '../card-record/card-record.module';
import { OrderModule } from '../order/order.module';
import { ProductModule } from '../product/product.module';
import { StudentModule } from '../student/student.module';
import { WxOrderModule } from '../wx-order/wx-order.module';
import { WxpayController } from './wxpay.controller';
import { WxPayResolver } from './wxpay.resolver';

@Module({
  imports: [
    WeChatPayModule.registerAsync({
      useFactory: async () => {
        return {
          appid: process.env.WXPAY_APPID,
          mchid: process.env.WXPAY_MCHID,
          publicKey: fs.readFileSync(
            process.env.WXPAY_DIR + '/apiclient_cert.pem',
          ), // 公钥
          privateKey: fs.readFileSync(
            process.env.WXPAY_DIR + '/apiclient_key.pem',
          ), // 秘钥
        };
      },
    }),
    StudentModule,
    ProductModule,
    OrderModule,
    WxOrderModule,
    CardRecordModule,
    ProductModule,
  ],
  controllers: [WxpayController],
  providers: [WxPayResolver],
})
export class WxpayModule {}
