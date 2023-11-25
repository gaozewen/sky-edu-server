import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { JwtGqlAuthGuard } from '../auth/auth.guard';
import { OSSDTO } from './oss.dto';
import { OSSService } from './oss.service';

@Resolver()
@UseGuards(JwtGqlAuthGuard)
export class OSSResolver {
  constructor(private readonly ossService: OSSService) {}

  @Query(() => OSSDTO, { description: '获取 OSS 上传凭证' })
  getUploadToken(): OSSDTO {
    return this.ossService.getUploadToken();
  }
}
