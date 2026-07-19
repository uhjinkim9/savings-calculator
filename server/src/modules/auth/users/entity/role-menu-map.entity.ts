import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RoleEntity } from './role.entity';

@Entity('role_menu_map')
export class RoleMenuMapEntity {
  /** 인덱스 */
  @PrimaryGeneratedColumn({
    name: 'idx',
    type: 'int',
    comment: '인덱스',
  })
  idx: number;

  /** 역할 ID */
  @Column({
    name: 'role_id',
    type: 'varchar',
    length: 20,
    default: 'all-user',
    nullable: false,
    comment: '역할 ID',
  })
  roleId: string;

  /** 메뉴 ID */
  @Column({
    name: 'menu_id',
    type: 'varchar',
    length: 20,
    nullable: false,
    comment: '메뉴 ID',
  })
  menuId: string;

  /** 생성자 ID */
  @Column({
    name: 'creator_id',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '생성자 ID',
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

  // /** 읽기 권한 */
  // @Column({
  //   name: 'is_readable',
  //   type: 'smallint',
  //   width: 1,
  //   default: 1,
  //   nullable: false,
  //   comment: '읽기 권한',
  // })
  // isReadable: number;

  // /** 쓰기 권한 */
  // @Column({
  //   name: 'is_writable',
  //   type: 'smallint',
  //   width: 1,
  //   default: 1,
  //   nullable: false,
  //   comment: '쓰기 권한',
  // })
  // isWritable: number;

  /** 사용자 */
  @Column({
    name: 'role_user',
    type: 'smallint',
    default: 1,
    nullable: false,
    comment: '역할 구분: 사용자',
  })
  roleUser: number;

  /** 관리자 */
  @Column({
    name: 'role_admin',
    type: 'smallint',
    default: 1,
    nullable: false,
    comment: '역할 구분: 관리자',
  })
  roleAdmin: number;

  /** 사용 여부 */
  @Column({
    name: 'is_used',
    type: 'smallint',
    default: 1,
    comment: '사용 여부',
  })
  isUsed: number;

  /** 생성일 */
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    comment: '생성일',
  })
  createdAt: Date;

  /** 변경일 */
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    comment: '변경일',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
  })
  deletedAt?: Date;

  /** 역할 정보 참조 */
  @ManyToOne(() => RoleEntity, (role) => role.roleMenus, {
    createForeignKeyConstraints: false, // 참조는 가능하지만 DB상 물리적인 FK는 생성되지 않는 옵션
  })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'roleId' })
  role: RoleEntity;
}
