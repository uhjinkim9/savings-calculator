import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
  Unique,
} from "typeorm";

@Entity("menu_tree")
@Unique(["menuId"])
export class MenuTreeEntity {
  /** 노드 인덱스 (자동 증가) */
  @PrimaryGeneratedColumn({
    name: "idx",
    type: "int",
    comment: "노드 인덱스",
  })
  idx: number;

  /** 메뉴 ID */
  @Column({
    name: "menu_id",
    type: "varchar",
    length: 30,
    nullable: false,
    comment: "메뉴 ID",
  })
  menuId: string;

  /** 중분류/소분류 메뉴 이름 */
  @Column({
    name: "menu_nm",
    type: "varchar",
    length: 50,
    nullable: false,
    comment: "중분류/소분류 메뉴 이름",
  })
  menuNm: string;

  /** 메뉴 노드 레벨 */
  @Column({
    name: "node_level",
    type: "int",
    nullable: false,
    comment: "메뉴 노드 레벨, 숫자가 작을수록 상위 단계",
  })
  nodeLevel: number;

  /** 상위 노드 ID */
  @Column({
    name: "upper_node",
    type: "varchar",
    length: 500,
    nullable: false,
    comment: "상위 노드 ID",
  })
  upperNode: string;

  /** 메뉴 사용 여부 */
  @Column({
    name: "is_used",
    type: "smallint",
    default: 1,
    nullable: false,
    comment: "메뉴 사용 여부",
  })
  isUsed: number;

  /** 메뉴 ID 변경 가능 여부 */
  @Column({
    name: "is_changeable",
    type: "smallint",
    default: 1,
    nullable: false,
    comment: "메뉴 ID 변경 가능 여부 (1: 변경 가능, 0: 변경 불가)",
  })
  isChangeable: number;

  /** 정렬 순서 */
  @Column({
    name: "seq_num",
    type: "int",
    default: 1,
    nullable: false,
    comment: "정렬 순서",
  })
  seqNum: number;

  /** 생성일 */
  @CreateDateColumn({name: "created_at", type: "timestamp", comment: "생성일"})
  createdAt: Date;

  /** 변경일 */
  @UpdateDateColumn({name: "updated_at", type: "timestamp", comment: "변경일"})
  updatedAt: Date;

  @DeleteDateColumn({
    name: "deleted_at",
    type: "timestamp",
  })
  deletedAt?: Date;

  // 다대일: 자식 -> 부모
  @ManyToOne(() => MenuTreeEntity, (parent) => parent.children, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({name: "upper_node", referencedColumnName: "menuId"})
  parent?: MenuTreeEntity;

  // 일대다: 부모 -> 자식
  @OneToMany(() => MenuTreeEntity, (child) => child.parent)
  children?: MenuTreeEntity[];
}
