import { Injectable } from '@nestjs/common';
import { auth, rs } from 'qiniu';

import { OSSDTO } from './oss.dto';

@Injectable()
export class OSSService {
  /**
   * @description 获取 OSS 上传 uploadToken
   * @see https://developer.qiniu.com/kodo/sdk/nodejs
   * @return {OSSDTO}  {OSSDTO}
   * @memberof OSSService
   */
  getUploadToken(): OSSDTO {
    try {
      const accessKey = process.env.QINIU_ACCESS_KEY;
      const secretKey = process.env.QINIU_SECRET_KEY;
      const bucket = process.env.QINIU_BUCKET;
      const mac = new auth.digest.Mac(accessKey, secretKey);
      const putPolicy = new rs.PutPolicy({
        scope: bucket,
      });
      const uploadToken = putPolicy.uploadToken(mac);
      return { uploadToken };
    } catch (error) {
      console.error('ERROR【getUploadToken】：', error);
      return { uploadToken: '' };
    }
  }
}
