import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { MTOProvider, PaymentChannel, CorridorStatus, FeeType, MarginType } from '@src/common/enums';
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
  id: string;

  @Column({
    type: 'enum',
    enum: MTOProvider,
  })
  mto: MTOProvider;

  @Column()
  country: string;

  @Column({
    type: 'enum',
    enum: PaymentChannel,
  })
  paymentChannel: PaymentChannel;

  @Column()
  currency: string;

  @Column({
    type: 'enum',
    enum: CorridorStatus,
    default: CorridorStatus.ACTIVE,
  })
  status: CorridorStatus;

  @Column({
    type: 'enum',
    enum: FeeType,
    nullable: false,
  })
  feeType: FeeType;

  @Column({
    type: 'enum',
    enum: MarginType,
    nullable: false,
  })
  marginType: MarginType;

  @ManyToOne(() => Organization, organization => organization.corridors, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  organizationId: string;

  @OneToMany(() => FeesSlab, feesSlab => feesSlab.corridor, { cascade: true })
  feesSlabs: FeesSlab[];

  @OneToMany(() => FixedFee, fixedFee => fixedFee.corridor, { cascade: true })
  fixedFees: FixedFee[];

  @OneToMany(() => BankFeeConfig, bankFeeConfig => bankFeeConfig.corridor, { cascade: true })
  bankFeeConfigs: BankFeeConfig[];

  @OneToMany(() => TimingFee, timingFee => timingFee.corridor, { cascade: true })
  timingFees: TimingFee[];

  @OneToMany(() => FixedMargin, fixedMargin => fixedMargin.corridor, { cascade: true })
  fixedMargins: FixedMargin[];

  @OneToMany(() => MarginSlab, marginSlab => marginSlab.corridor, { cascade: true })
  marginSlabs: MarginSlab[];

  @OneToMany(() => TimingMargin, timingMargin => timingMargin.corridor, { cascade: true })
  timingMargins: TimingMargin[];

  @OneToMany(() => BankMarginConfig, bankMarginConfig => bankMarginConfig.corridor, { cascade: true })
  bankMarginConfigs: BankMarginConfig[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
