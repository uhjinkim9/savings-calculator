import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import {DepositStatus} from "./savings.enums";
import {SavingsEntity} from "./savings.entity";

@Entity("deposits")
@Unique("uq_deposit_schedule", ["savingsId", "dueDate"])
@Index("idx_deposits_savings_id", ["savingsId"])
@Index("idx_deposits_adjusted_date", ["adjustedDate"])
@Check("chk_deposit_origin_amount_positive", '"origin_amount" > 0')
@Check("chk_deposit_exchange_rate_positive", '"exchange_rate" IS NULL OR "exchange_rate" > 0')
@Check("chk_deposit_exchange_unit_positive", '"exchange_rate_unit" > 0')
@Check(
  "chk_deposit_completed_at",
  `("status" = 'COMPLETED' AND "completed_at" IS NOT NULL AND "krw_amount" IS NOT NULL) OR
   ("status" <> 'COMPLETED')`,
)
export class DepositEntity {
  @PrimaryGeneratedColumn({type: "bigint"})
  id: string;

  @Column({name: "savings_id", type: "uuid"})
  savingsId: string;

  @ManyToOne(() => SavingsEntity, (savings) => savings.deposits, {onDelete: "CASCADE"})
  @JoinColumn({name: "savings_id"})
  savings: SavingsEntity;

  @Column({type: "enum", enum: DepositStatus, default: DepositStatus.SCHEDULED})
  status: DepositStatus;

  @Column({name: "due_date", type: "date"})
  dueDate: string;

  @Column({name: "adjusted_date", type: "date"})
  adjustedDate: string;

  @Column({name: "completed_at", type: "timestamptz", nullable: true})
  completedAt: Date | null;

  @Column({name: "origin_amount", type: "numeric", precision: 20, scale: 4})
  originAmount: string;

  @Column({name: "currency_code", type: "char", length: 3})
  currencyCode: string;

  @Column({name: "krw_amount", type: "numeric", precision: 20, scale: 4, nullable: true})
  krwAmount: string | null;

  @Column({name: "exchange_rate", type: "numeric", precision: 20, scale: 8, nullable: true})
  exchangeRate: string | null;

  @Column({name: "exchange_rate_unit", type: "numeric", precision: 20, scale: 4, default: 1})
  exchangeRateUnit: string;

  @Column({name: "exchange_rate_date", type: "date", nullable: true})
  exchangeRateDate: string | null;

  @CreateDateColumn({name: "created_at", type: "timestamptz"})
  createdAt: Date;

  @UpdateDateColumn({name: "updated_at", type: "timestamptz"})
  updatedAt: Date;
}
