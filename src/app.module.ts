import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CardModule } from './modules/card/card.module';
import { CourseModule } from './modules/course/course.module';
import { OrderModule } from './modules/order/order.module';
import { OSSModule } from './modules/oss/oss.module';
import { ProductModule } from './modules/product/product.module';
import { SMSModule } from './modules/sms/sms.module';
import { StoreModule } from './modules/store/store.module';
import { StudentModule } from './modules/student/student.module';
import { UserModule } from './modules/user/user.module';
import { WxOrderModule } from './modules/wx-order/wx-order.module';
import { WxpayModule } from './modules/wxpay/wxpay.module';

config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [`${__dirname}/modules/**/*.entity{.ts,.js}`],
      logging: true,
      synchronize: true,
      autoLoadEntities: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // 放到内存中自动生成
      autoSchemaFile: true,
      // 也可以放到本地
      // autoSchemaFile: './schema.gql',
    }),
    ConfigModule.forRoot(),
    UserModule,
    OSSModule,
    SMSModule,
    AuthModule,
    StoreModule,
    StudentModule,
    CourseModule,
    CardModule,
    ProductModule,
    WxpayModule,
    OrderModule,
    WxOrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
