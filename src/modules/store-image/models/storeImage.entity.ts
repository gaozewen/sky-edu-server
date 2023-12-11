import { IsNotEmpty } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Store } from '@/modules/store/models/store.entity';

/**
 * 门店资源
 */
@Entity('store_image')
export class StoreImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    comment: '图片地址',
  })
  @IsNotEmpty()
  url: string;

  @Column({
    comment: 'remark',
    nullable: true,
  })
  remark: string;

  // () => Store,
  // 这个 Store 代表 多 对 1，1 的这个实体类型
  // (store) => store.frontImgs,
  // 这个 store.frontImgs 代表 多 对 1，在 1 这个实体类中，哪个字段表示 多
  @ManyToOne(() => Store, (store) => store.frontImgs)
  @JoinColumn({ name: 'store_id_for_front_img' })
  storeForFrontImg: Store;

  @ManyToOne(() => Store, (store) => store.roomImgs)
  @JoinColumn({ name: 'store_id_for_room_img' })
  storeForRoomImg: Store;

  @ManyToOne(() => Store, (store) => store.otherImgs)
  @JoinColumn({ name: 'store_id_for_other_img' })
  storeForOtherImg: Store;
}
