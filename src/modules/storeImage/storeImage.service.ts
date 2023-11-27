import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StoreImage } from './models/storeImage.entity';

@Injectable()
export class StoreImageService {
  constructor(
    @InjectRepository(StoreImage)
    private readonly storeImageRepository: Repository<StoreImage>,
  ) {}

  async deleteByStoreId(id): Promise<boolean> {
    const imgs = await this.storeImageRepository
      .createQueryBuilder('store_image')
      .where(`store_image.store_id_for_front_img = '${id}'`)
      .orWhere(`store_image.store_id_for_room_img = '${id}'`)
      .orWhere(`store_image.store_id_for_other_img = '${id}'`)
      .getMany();
    if (imgs.length === 0) {
      return true;
    }
    const delResult = await this.storeImageRepository.delete(
      imgs.map((item) => item.id),
    );

    if (delResult.affected > 0) {
      return true;
    }
    return false;
  }
}
