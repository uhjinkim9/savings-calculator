import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

/**
 * @fileoverview Token 엔티티
 */
@Unique(['userId', 'deviceId'])
@Entity('tokens')
export class TokenEntity {
  /** 토큰 인덱스 */
  @PrimaryGeneratedColumn({
    name: 'token_idx',
    type: 'int',
    comment: '토큰 인덱스',
  })
  tokenIdx: number;

  /** 사용자 ID */
  @Column({
    name: 'user_id',
    type: 'varchar',
    length: 20,
    nullable: false,
    comment: '사용자 ID',
  })
  userId: string;

  /** 기기 식별자 */
  @Column({
    name: 'device_id',
    type: 'varchar',
    length: 40,
    nullable: false,
    comment: '기기 식별자',
  })
  deviceId: string;

  /** 리프레시 토큰 */
  @Column({
    name: 'refresh_token',
    type: 'varchar',
    length: 500,
    nullable: false,
    comment: '리프레시 토큰',
  })
  refreshToken: string;

  /** 로그인 IP */
  @Column({
    name: 'login_ip',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '로그인 IP',
  })
  loginIp: string | null;

  /** 사용자 에이전트 */
  @Column({
    name: 'user_agent',
    type: 'varchar',
    length: 1000,
    nullable: true,
    comment: '사용자 에이전트',
  })
  userAgent: string | null;

  // /** 발급 일자 */
  // @Column({
  //   name: 'issue_date',
  //   type: 'timestamp',
  //   nullable: true,
  //   comment: '발급 일자',
  // })
  // issueDate: Date;

  // /** 만료 일자 */
  // @Column({
  //   name: 'expire_date',
  //   type: 'timestamp',
  //   nullable: true,
  //   comment: '만료 일자',
  // })
  // expireDate: Date;

  /** 생성일 */
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', comment: '생성일' })
  createdAt: Date;

  /** 변경일 */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', comment: '변경일' })
  updatedAt: Date;
}
