import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from "typeorm";
import {PlanTypes, PlanVisibilityTypes} from "../etc/plan.enum";
import {DayoffEntity} from "./dayoff.entity";
import {ScheduleEntity} from "./schedule.entity";
import {TaskEntity} from "./task.entity";
import {RepeatRuleEntity} from "./repeat-rule.entity";

@Entity("plans")
export class PlanEntity {
  @PrimaryGeneratedColumn({
    name: "plan_idx",
    type: "int",
    comment: "플랜 IDX",
  })
  planIdx: number;

  @Column({
    name: "plan_type",
    type: "enum",
    enum: PlanTypes,
    comment: "플랜 종류",
  })
  planType: PlanTypes;

  @Column({
    name: "menu_idx",
    type: "int",
    nullable: true,
    comment: "캘린더 인덱스, 이 일정이 속한 캘린더 그룹",
  })
  menuIdx: number;

  @Column({name: "title", type: "varchar", length: 255})
  title: string;

  @Column({
    name: "visibility",
    type: "enum",
    enum: PlanVisibilityTypes,
    default: PlanVisibilityTypes.PRIVATE,
    comment: "공개 범위",
  })
  visibility: PlanVisibilityTypes;

  @Column({name: "is_allday", type: "smallint", default: 0})
  isAllday: number;

  @Column({name: "is_repeated", type: "smallint", default: 0})
  isRepeated: number;

  @Column({
    name: "started_at",
    type: "timestamp",
    nullable: true,
    comment: '시작일: "종일"일 경우 날짜까지만 가져올 예정',
  })
  startedAt: string;

  @Column({name: "ended_at", type: "timestamp", nullable: true})
  endedAt: string;

  @CreateDateColumn({name: "created_at", type: "timestamp"})
  createdAt: Date;

  @UpdateDateColumn({name: "updated_at", type: "timestamp"})
  updatedAt: Date;

  @OneToOne(() => ScheduleEntity, (schedule) => schedule.plan)
  schedule: ScheduleEntity;

  @OneToOne(() => DayoffEntity, (dayoff) => dayoff.plan)
  dayoff: DayoffEntity;

  @OneToOne(() => TaskEntity, (task) => task.plan)
  task: TaskEntity;

  // 자원 예약도 있어야 함

  @OneToOne(() => RepeatRuleEntity, {
    createForeignKeyConstraints: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({name: "plan_idx", referencedColumnName: "planIdx"}) // 필요시 FK 명시
  repeatRule: RepeatRuleEntity;
}
