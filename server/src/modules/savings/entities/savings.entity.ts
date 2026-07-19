import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {UserEntity} from "../../auth/users/entity/user.entity";
import {DepositEntity} from "./deposit.entity";
import {InstitutionEntity} from "./institution.entity";
import {AdjustmentPolicy, RecurrenceType, SavingsEndType} from "./savings.enums";

@Entity("savings")
@Index("idx_savings_user_id", ["userId"])
@Check("chk_savings_amount_positive", '"amount" > 0')
@Check("chk_savings_target_positive", '"target_amount" IS NULL OR "target_amount" > 0')
@Check("chk_savings_interval_positive", '"interval_value" > 0')
@Check(
  "chk_savings_weekday",
  '"day_of_week" IS NULL OR "day_of_week" BETWEEN 1 AND 7',
)
@Check(
  "chk_savings_monthday",
  '"day_of_month" IS NULL OR "day_of_month" BETWEEN 1 AND 31',
)
@Check(
  "chk_savings_end_condition",
  `("end_type" = 'INDEFINITE' AND "end_date" IS NULL) OR
   ("end_type" = 'DATE' AND "end_date" IS NOT NULL AND "end_date" >= "start_date")`,
)
@Check(
  "chk_savings_recurrence_fields",
  `("recurrence_type" = 'DAILY' AND "day_of_week" IS NULL AND "day_of_month" IS NULL) OR
   ("recurrence_type" = 'WEEKLY' AND "day_of_week" IS NOT NULL AND "day_of_month" IS NULL) OR
   ("recurrence_type" = 'MONTHLY' AND "day_of_week" IS NULL AND
      (("use_last_day_of_month" = true AND "day_of_month" IS NULL) OR
       ("use_last_day_of_month" = false AND "day_of_month" IS NOT NULL)))`,
)
export class SavingsEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({name: "user_id", type: "varchar", length: 20})
  userId: string;

  @ManyToOne(() => UserEntity, {onDelete: "CASCADE"})
  @JoinColumn({name: "user_id"})
  user: UserEntity;

  @Column({name: "institution_id", type: "uuid", nullable: true})
  institutionId: string | null;

  @ManyToOne(() => InstitutionEntity, (institution) => institution.savingsItems, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({name: "institution_id"})
  institution: InstitutionEntity | null;

  @Column({type: "varchar", length: 100})
  name: string;

  @Column({type: "numeric", precision: 20, scale: 4})
  amount: string;

  @Column({name: "currency_code", type: "char", length: 3, default: "KRW"})
  currencyCode: string;

  @Column({name: "target_amount", type: "numeric", precision: 20, scale: 4, nullable: true})
  targetAmount: string | null;

  @Column({name: "recurrence_type", type: "enum", enum: RecurrenceType})
  recurrenceType: RecurrenceType;

  @Column({name: "interval_value", type: "int", default: 1})
  intervalValue: number;

  @Column({name: "day_of_week", type: "smallint", nullable: true})
  dayOfWeek: number | null;

  @Column({name: "day_of_month", type: "smallint", nullable: true})
  dayOfMonth: number | null;

  @Column({name: "use_last_day_of_month", type: "boolean", default: false})
  useLastDayOfMonth: boolean;

  @Column({name: "start_date", type: "date"})
  startDate: string;

  @Column({name: "end_type", type: "enum", enum: SavingsEndType, default: SavingsEndType.INDEFINITE})
  endType: SavingsEndType;

  @Column({name: "end_date", type: "date", nullable: true})
  endDate: string | null;

  @Column({
    name: "adjustment_policy",
    type: "enum",
    enum: AdjustmentPolicy,
    default: AdjustmentPolicy.NONE,
  })
  adjustmentPolicy: AdjustmentPolicy;

  @Column({type: "text", nullable: true})
  memo: string | null;

  @CreateDateColumn({name: "created_at", type: "timestamptz"})
  createdAt: Date;

  @UpdateDateColumn({name: "updated_at", type: "timestamptz"})
  updatedAt: Date;

  @OneToMany(() => DepositEntity, (deposit) => deposit.savings)
  deposits: DepositEntity[];
}
