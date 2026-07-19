import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

import { RoleMenuMapEntity } from './role-menu-map.entity';
import { UserEntity } from './user.entity';

@Entity('roles')
export class RoleEntity {
  /** 역할 ID */
  @PrimaryColumn({
    name: 'role_id',
    type: 'varchar',
    length: 20,
    comment: '역할 ID',
  })
  roleId: string;

  /** 역할명 */
  @Column({
    name: 'role_nm',
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '역할명',
  })
  roleNm: string;

  /** 설명 */
  @Column({
    name: 'memo',
    type: 'text',
    nullable: true,
    comment: '설명',
  })
  memo: string | null;

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

  /** 사용 여부 */
  @Column({
    name: 'is_used',
    type: 'smallint',
    default: 1,
    nullable: false,
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

  /** 역할에 연결된 메뉴들 */
  @OneToMany(() => RoleMenuMapEntity, (roleMenus) => roleMenus.role, {
    cascade: true,
  })
  roleMenus: RoleMenuMapEntity[];

  /** 유저에 연결된 메뉴들 */
  @OneToMany(() => UserEntity, (role) => role.role, {
    cascade: true,
  })
  users: UserEntity[];
}
