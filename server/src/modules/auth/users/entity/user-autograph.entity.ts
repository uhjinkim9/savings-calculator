import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

/**
 * 전자서명 이미지 엔티티
 */
@Entity('user_autographs')
export class UserAutographEntity {
  /** 전자서명 이미지 인덱스 */
  @PrimaryGeneratedColumn({ name: 'autograph_idx' })
  autographIdx: number;

  /** 사용자 ID */
  @Column({ name: 'user_id', type: 'varchar', length: 20, nullable: false })
  userId: string;

  /** 전자서명 이미지 파일명 */
  @Column({ name: 'img_nm', type: 'varchar', length: 50, nullable: true })
  imgNm: string | null;

  /** 전자서명 이미지 파일 경로 */
  @Column({ name: 'img_path', type: 'varchar', length: 500, nullable: true })
  imgPath: string | null;

  /** 등록일 */
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
