import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";

@Entity("admin_menus")
export class AdminMenuEntity {
  @PrimaryGeneratedColumn({
    name: "menu_idx",
    type: "int",
    comment: "인덱스",
  })
  menuIdx: number;

  /** 메뉴 ID */
  @Column({
    name: "menu_id",
    type: "varchar",
    length: 30,
    nullable: false,
    comment: "사이드바 메뉴 ID, URL과 재귀 조회에 사용",
  })
  menuId: string;

  /** 중분류/소분류 메뉴 이름 */
  @Column({
    name: "menu_nm",
    type: "varchar",
    length: 50,
    nullable: false,
    comment: "사이드바 메뉴 이름",
  })
  menuNm: string;

  /** 메뉴 노드 레벨 */
  @Column({
    name: "node_level",
    type: "int",
    nullable: false,
    comment:
      "사이드바에서만 사용하는 메뉴 노드 레벨(menu 테이블의 menu_tree와 별개), 숫자가 작을수록 상위 단계",
  })
  nodeLevel: number;

  /** 상위 노드 ID */
  @Column({
    name: "upper_node",
    type: "varchar",
    length: 50,
    nullable: false,
    comment: "상위 노드",
    default: "admin",
  })
  upperNode: string;

  /** 설명 */
  @Column({
    name: "memo",
    type: "varchar",
    length: 1000,
    nullable: true,
    comment: "설명",
  })
  memo: string | null;

  /** 메뉴 사용 여부 */
  @Column({
    name: "is_used",
    type: "smallint",
    default: 1,
    nullable: false,
    comment: "메뉴 사용 여부",
  })
  isUsed: number;

  /** 정렬 순서 */
  @Column({
    name: "seq_num",
    type: "int",
    default: 1,
    nullable: false,
    comment: "정렬 순서",
  })
  seqNum: number;

  @Column({
    name: "creator_id",
    type: "varchar",
    length: 20,
    nullable: true,
    comment: "등록자 ID",
  })
  creatorId: string;

  @Column({
    name: "updater_id",
    type: "varchar",
    length: 20,
    nullable: true,
    comment: "변경자 ID",
  })
  updaterId: string;

  @CreateDateColumn({name: "created_at", type: "timestamp"})
  createdAt: Date;

  @UpdateDateColumn({name: "updated_at", type: "timestamp"})
  updatedAt: Date;

  /** 자기 참조 */
  @OneToMany(() => AdminMenuEntity, (child) => child.parent)
  children: AdminMenuEntity[];
  @ManyToOne(() => AdminMenuEntity, (parent) => parent.children, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({name: "upper_node", referencedColumnName: "menuId"})
  parent: AdminMenuEntity;
}
