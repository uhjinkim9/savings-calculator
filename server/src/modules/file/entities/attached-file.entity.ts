import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('attached_files')
export class AttachedFileEntity {
  /** 파일 인덱스 */
  @PrimaryGeneratedColumn({
    name: 'file_idx',
    type: 'int',
    comment: '파일 인덱스',
  })
  fileIdx: number;

  /** 파일 유형 */
  @Column({
    name: 'file_type',
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '파일 유형',
  })
  fileType: string;

  /** 파일 이름 */
  @Column({
    name: 'file_name',
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: '파일 이름',
  })
  fileName: string;

  /** 파일 크기 */
  @Column({
    name: 'file_size',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '파일 크기',
  })
  fileSize: string;

  /** 파일 경로 */
  @Column({
    name: 'file_path',
    type: 'varchar',
    length: 1000,
    nullable: false,
    comment: '파일 경로',
  })
  filePath: string;

  /** 모듈 이름 */
  @Column({
    name: 'module_nm',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '모듈 이름',
  })
  moduleNm: string;

  /** 업로드일 */
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    comment: '업로드일',
  })
  createdAt: Date;
}
