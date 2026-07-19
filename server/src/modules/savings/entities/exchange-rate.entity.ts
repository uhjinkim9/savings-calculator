import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

@Entity("exchange_rates")
@Unique("uq_exchange_rate_currency_date", ["currencyCode", "baseCurrency", "baseDate"])
@Check("chk_exchange_rate_positive", '"rate" > 0 AND "unit_amount" > 0')
export class ExchangeRateEntity {
  @PrimaryGeneratedColumn({type: "bigint"})
  id: string;

  @Column({name: "currency_code", type: "char", length: 3})
  currencyCode: string;

  @Column({name: "base_currency", type: "char", length: 3, default: "KRW"})
  baseCurrency: string;

  @Column({name: "base_date", type: "date"})
  baseDate: string;

  @Column({type: "numeric", precision: 20, scale: 8})
  rate: string;

  @Column({name: "unit_amount", type: "numeric", precision: 20, scale: 4, default: 1})
  unitAmount: string;

  @CreateDateColumn({name: "created_at", type: "timestamptz"})
  createdAt: Date;
}
