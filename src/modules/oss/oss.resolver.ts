import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { JwtGqlAuthGuard } from '../auth/guard/jwt.gql.guard';
import { OSSVO } from './dto/oss.vo';
import { OSSService } from './oss.service';

@Resolver()
@UseGuards(JwtGqlAuthGuard)
export class OSSResolver {
  constructor(private readonly ossService: OSSService) {}

  @Query(() => OSSVO, { description: '获取 OSS 上传凭证' })
  getUploadToken(): OSSVO {
    return this.ossService.getUploadToken();
  }
}
