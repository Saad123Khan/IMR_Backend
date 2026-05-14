import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { CorridorStatus, FeeType, MarginType } from '@src/common/enums';
import { FeesSlab } from './fees-slab.entity';
import { FixedFee } from './fixed-fee.entity';
import { BankFeeConfig } from './bank-fee-config.entity';
import { TimingFee } from './timing-fee.entity';
import { FixedMargin } from './fixed-margin.entity';
import { MarginSlab } from './margin-slab.entity';
import { TimingMargin } from './timing-margin.entity';
import { BankMarginConfig } from './bank-margin-config.entity';


@Entity('corridors')
export class Corridor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  mto!: string;

  @Column()
  country!: string;

  @Column({ nullable: true })
  countryName?: string;

  @Column({ type: 'varchar', length: 100 })
  paymentChannel!: string;

  @Column({ nullable: true })
  paymentChannelName?: string;

  @Column()
  currency!: string;

  @Column({
    type: 'enum',
    enum: CorridorStatus,
    default: CorridorStatus.ACTIVE,
  })
  status!: CorridorStatus;

  @Column({
    type: 'enum',
    enum: FeeType,
    default: FeeType.AS_PER_MTO,
    nullable: false,
  })
  feeType!: FeeType;

  @Column({
    type: 'enum',
    enum: MarginType,
    default: MarginType.AS_PER_MTO,
    nullable: false,
  })
  marginType!: MarginType;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0.0 })
  defaultTimingFeeValue!: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0.0 })
  defaultTimingMarginValue!: number;

  @ManyToOne(() => Organization, organization => organization.corridors, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @Column({ nullable: true })
  organizationId?: string;

  @OneToMany(() => FeesSlab, feesSlab => feesSlab.corridor, { cascade: true, lazy: true })
  feesSlabs!: Promise<FeesSlab[]>;

  @OneToMany(() => FixedFee, fixedFee => fixedFee.corridor, { cascade: true, lazy: true })
  fixedFees!: Promise<FixedFee[]>;

  @OneToMany(() => BankFeeConfig, bankFeeConfig => bankFeeConfig.corridor, { cascade: true, lazy: true })
  bankFeeConfigs!: Promise<BankFeeConfig[]>;

  @OneToMany(() => TimingFee, timingFee => timingFee.corridor, { cascade: true, lazy: true })
  timingFees!: Promise<TimingFee[]>;

  @OneToMany(() => FixedMargin, fixedMargin => fixedMargin.corridor, { cascade: true, lazy: true })
  fixedMargins!: Promise<FixedMargin[]>;

  @OneToMany(() => MarginSlab, marginSlab => marginSlab.corridor, { cascade: true, lazy: true })
  marginSlabs!: Promise<MarginSlab[]>;

  @OneToMany(() => TimingMargin, timingMargin => timingMargin.corridor, { cascade: true, lazy: true })
  timingMargins!: Promise<TimingMargin[]>;

  @OneToMany(() => BankMarginConfig, bankMarginConfig => bankMarginConfig.corridor, { cascade: true, lazy: true })
  bankMarginConfigs!: Promise<BankMarginConfig[]>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
