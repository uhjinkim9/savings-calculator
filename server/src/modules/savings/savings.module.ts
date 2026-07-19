import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {DepositEntity} from "./entities/deposit.entity";
import {ExchangeRateEntity} from "./entities/exchange-rate.entity";
import {HolidayEntity} from "./entities/holiday.entity";
import {InstitutionEntity} from "./entities/institution.entity";
import {SavingsEntity} from "./entities/savings.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstitutionEntity,
      HolidayEntity,
      ExchangeRateEntity,
      SavingsEntity,
      DepositEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class SavingsModule {}
