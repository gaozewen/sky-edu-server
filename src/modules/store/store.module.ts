import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StoreImage } from '../store-image/models/store-image.entity';
import { StoreImageService } from '../store-image/store-image.service';
import { Store } from './models/store.entity';
import { StoreResolver } from './store.resolver';
import { StoreService } from './store.service';

@Module({
  imports: [TypeOrmModule.forFeature([Store, StoreImage])],
  providers: [StoreService, StoreResolver, StoreImageService],
  exports: [StoreService],
})
export class StoreModule {}
