import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {SavingsEntity} from "./savings.entity";

@Entity("institutions")
export class InstitutionEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({type: "varchar", length: 100})
  name: string;

  @Column({type: "varchar", length: 30, nullable: true, unique: true})
  code: string | null;

  @Column({name: "logo_url", type: "text", nullable: true})
  logoUrl: string | null;

  @CreateDateColumn({name: "created_at", type: "timestamptz"})
  createdAt: Date;

  @UpdateDateColumn({name: "updated_at", type: "timestamptz"})
  updatedAt: Date;

  @OneToMany(() => SavingsEntity, (savings) => savings.institution)
  savingsItems: SavingsEntity[];
}
