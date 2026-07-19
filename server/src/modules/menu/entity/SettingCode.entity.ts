import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SettingCodeDetailEntity } from './SettingCodeDetail.entity';

/**
 * @fileoverview SettingCode 엔티티
 * @description 게시판 설정 코드를 저장하는 테이블
 *
 * @author 김어진
 * @created 2025-03-28
 * @version 1.0.0
 */
@Entity('setting_code')
export class SettingCodeEntity {
  /** 설정 코드 분류 */
  @PrimaryGeneratedColumn({
    name: 'code_idx',
    type: 'int',
    comment: '코드 구분 인덱스',
  })
  codeIdx: string;

  /** 설정 코드 분류 */
  @Column({
    name: 'code_class',
    type: 'varchar',
    length: 20,
    nullable: false,
    unique: true,
    comment: '코드 분류',
  })
  codeClass: string;

  /** 설명 */
  @Column({
    name: 'memo',
    type: 'varchar',
    length: 1000,
    nullable: true,
    comment: '설명',
  })
  memo: string | null;

  /** 사용 여부 */
  @Column({
    name: 'is_used',
    type: 'smallint',
    default: 1,
    nullable: false,
    comment: '사용 여부 (1: true, 0: false)',
  })
  isUsed: number;

  /** 등록자 ID */
  @Column({
    name: 'creator_id',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '등록자 ID',
  })
  creatorId: string | null;

  /** 변경자 ID */
  @Column({
    name: 'updater_id',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '변경자 ID',
  })
  updaterId: string | null;

  /** 생성일 */
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', comment: '생성일' })
  createdAt: Date;

  /** 변경일 */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', comment: '변경일' })
  updatedAt: Date;

  @OneToMany(() => SettingCodeDetailEntity, (detail) => detail.codeGroup)
  detail: SettingCodeDetailEntity[];
}
