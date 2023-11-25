import { Query, Resolver } from '@nestjs/graphql';

import { OSSDTO } from './oss.dto';
import { OSSService } from './oss.service';

@Resolver()
export class OSSResolver {
  constructor(private readonly ossService: OSSService) {}

  @Query(() => OSSDTO, { description: '获取 OSS 上传凭证' })
  getUploadToken(): OSSDTO {
    return this.ossService.getUploadToken();
  }
}
