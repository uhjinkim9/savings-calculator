import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("holidays")
export class HolidayEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: "holiday_date", type: "date", unique: true})
  holidayDate: string;

  @Column({name: "date_name", type: "varchar", length: 100})
  dateName: string;

  @Column({name: "is_holiday", type: "boolean", default: true})
  isHoliday: boolean;

  @Column({name: "country_code", type: "char", length: 2, default: "KR"})
  countryCode: string;

  @CreateDateColumn({name: "created_at", type: "timestamptz"})
  createdAt: Date;
}
