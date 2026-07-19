import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from "typeorm";
import {RoleEntity} from "./role.entity";

@Entity("users")
export class UserEntity {
  /** 사용자 ID */
  @PrimaryColumn({
    name: "user_id",
    type: "varchar",
    length: 20,
    comment: "사용자 ID",
  })
  userId: string;

  /** 회사 ID */
  @Column({
    name: "company_id",
    type: "varchar",
    length: 20,
    nullable: false,
    comment: "회사 ID",
  })
  companyId: string;

  /** 사용자 이름 */
  @Column({
    name: "user_nm",
    type: "varchar",
    length: 50,
    nullable: false,
    comment: "사용자 이름",
  })
  userNm: string;

  /** 사용자 비밀번호 */
  @Column({
    name: "user_pw",
    type: "varchar",
    length: 500,
    nullable: false,
    comment: "사용자 비밀번호",
  })
  userPw: string;

  /** 계정 사용 여부 */
  @Column({
    name: "is_used",
    type: "smallint",
    default: 1,
    nullable: false,
    comment: "계정 사용 여부 (1: true, 0: false)",
  })
  isUsed: number;

  /** 계정 제한 여부 */
  @Column({
    name: "is_restricted",
    type: "smallint",
    default: 0,
    nullable: false,
    comment: "계정 제한 여부 (1: true, 0: false)",
  })
  isRestricted: number;

  /** 역할 ID */
  @Column({
    name: "role_id",
    type: "varchar",
    length: 50,
    nullable: false,
    comment: "역할 ID",
  })
  roleId: string;

  /** 로그인 실패 횟수 */
  @Column({
    name: "login_fail_count",
    type: "int",
    nullable: true,
    comment: "로그인 실패 횟수",
  })
  loginFailCount: number | null;

  /** 이메일 */
  @Column({
    name: "email",
    type: "varchar",
    length: 50,
    nullable: true,
    comment: "이메일",
  })
  email: string | null;

  /** 외부 이메일 */
  @Column({
    name: "ext_email",
    type: "varchar",
    length: 50,
    nullable: true,
    comment: "외부 이메일",
  })
  extEmail: string | null;

  /** 이메일 수신 여부 */
  @Column({
    name: "is_email_subscribed",
    type: "smallint",
    default: 1,
    nullable: false,
    comment: "이메일 수신 여부",
  })
  isEmailSubscribed: number;

  /** 생성일 */
  @CreateDateColumn({name: "created_at", type: "timestamp", comment: "생성일"})
  createdAt: Date;

  /** 변경일 */
  @UpdateDateColumn({name: "updated_at", type: "timestamp", comment: "변경일"})
  updatedAt: Date;

  @DeleteDateColumn({name: "deleted_at", type: "timestamp", comment: "삭제일"})
  deletedAt: Date;

  @ManyToOne(() => RoleEntity, (role) => role.users, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({name: "role_id"})
  role: RoleEntity;
}
