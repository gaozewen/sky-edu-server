import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { OSSModule } from './modules/oss/oss.module';
import { SMSModule } from './modules/sms/sms.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '000000',
      database: 'sky_edu',
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
