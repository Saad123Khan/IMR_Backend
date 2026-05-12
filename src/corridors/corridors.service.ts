import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Or, Repository } from 'typeorm';
import { Corridor } from './entities/corridor.entity';
import { FixedFee } from './entities/fixed-fee.entity';
import { FeesSlab } from './entities/fees-slab.entity';
import { BankFeeConfig } from './entities/bank-fee-config.entity';
import { TimingFee } from './entities/timing-fee.entity';
import { FixedMargin } from './entities/fixed-margin.entity';
import { MarginSlab } from './entities/margin-slab.entity';
import { TimingMargin } from './entities/timing-margin.entity';
import { BankMarginConfig } from './entities/bank-margin-config.entity';
import { CreateCorridorDto } from './dto/create-corridor.dto';
import { UpdateCorridorDto } from './dto/update-corridor.dto';
import { CreateFixedFeeDto } from './dto/fixed-fee.dto';
import { CreateFeesSlabDto } from './dto/fees-slab.dto';
import { CreateBankFeeConfigDto } from './dto/bank-fee-config.dto';
import { CreateTimingFeeDto } from './dto/timing-fee.dto';
import { CreateFixedMarginDto } from './dto/fixed-margin.dto';
import { CreateMarginSlabDto } from './dto/margin-slab.dto';
import { CreateTimingMarginDto } from './dto/timing-margin.dto';
import { CreateBankMarginConfigDto } from './dto/bank-margin-config.dto';

@Injectable()
export class CorridorsService {
  constructor(
    @InjectRepository(Corridor)
    private corridorsRepository: Repository<Corridor>,
    @InjectRepository(FixedFee)
    private fixedFeeRepository: Repository<FixedFee>,
    @InjectRepository(FeesSlab)
    private feesSlabRepository: Repository<FeesSlab>,
    @InjectRepository(BankFeeConfig)
    private bankFeeConfigRepository: Repository<BankFeeConfig>,
    @InjectRepository(TimingFee)
    private timingFeeRepository: Repository<TimingFee>,
    @InjectRepository(FixedMargin)
    private fixedMarginRepository: Repository<FixedMargin>,
    @InjectRepository(MarginSlab)
    private marginSlabRepository: Repository<MarginSlab>,
    @InjectRepository(TimingMargin)
    private timingMarginRepository: Repository<TimingMargin>,
    @InjectRepository(BankMarginConfig)
    private bankMarginConfigRepository: Repository<BankMarginConfig>,
  ) {}

  async create(createCorridorDto: CreateCorridorDto, organizationId: string): Promise<Corridor> {
    const corridor = this.corridorsRepository.create({
      ...createCorridorDto,
      organizationId,
    });
    return await this.corridorsRepository.save(corridor);
  }

  async findAll(organizationId: string, limit: number = 50, offset: number = 0): Promise<Corridor[]> {
    return await this.corridorsRepository.find({
      where: [
        { organizationId },
        { organizationId: IsNull() },
      ],
      order: { createdAt: 'DESC' },
      select: ['id', 'mto', 'country', 'countryName', 'paymentChannel', 'paymentChannelName', 'currency', 'status', 'feeType', 'marginType', 'organizationId', 'createdAt', 'updatedAt'],
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string, organizationId: string): Promise<Corridor> {
    const corridor = await this.corridorsRepository.findOne({
      where: [
        { id, organizationId },
        { id, organizationId: IsNull() },
      ],
    });

    if (!corridor) {
      throw new NotFoundException(`Corridor with ID ${id} not found`);
    }

    return corridor;
  }

  async update(id: string, updateCorridorDto: UpdateCorridorDto, organizationId: string): Promise<Corridor> {
    const corridor = await this.findOne(id, organizationId);

    // When feeType changes, deactivate all old fee configs so new type takes over
    if (updateCorridorDto.feeType && updateCorridorDto.feeType !== corridor.feeType) {
      await this.deactivateOtherFeeTypes(id);
    }

    // When marginType changes, deactivate all old margin configs so new type takes over
    if (updateCorridorDto.marginType && updateCorridorDto.marginType !== corridor.marginType) {
      await this.deactivateOtherMarginTypes(id);
    }

    Object.assign(corridor, updateCorridorDto);
    return await this.corridorsRepository.save(corridor);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const corridor = await this.findOne(id, organizationId);
    await this.corridorsRepository.remove(corridor);
  }

  async findByCountry(country: string, organizationId: string): Promise<Corridor[]> {
    return await this.corridorsRepository.find({
      where: { country, organizationId },
      select: ['id', 'mto', 'country', 'countryName', 'paymentChannel', 'paymentChannelName', 'currency', 'status', 'feeType', 'marginType', 'organizationId', 'createdAt', 'updatedAt'],
    });
  }

  async findByMTO(mto: string, organizationId: string): Promise<Corridor[]> {
    return await this.corridorsRepository.find({
      where: { mto, organizationId } as any,
      select: ['id', 'mto', 'country', 'countryName', 'paymentChannel', 'paymentChannelName', 'currency', 'status', 'feeType', 'marginType', 'organizationId', 'createdAt', 'updatedAt'],
    });
  }

  async findByFilters(
    organizationId: string,
    filters: {
      country?: string;
      mto?: string;
      status?: string;
      paymentChannel?: string;
      currency?: string;
      feeType?: string;
    },
    limit: number = 50,
    offset: number = 0,
  ): Promise<Corridor[]> {
    const where: any = {};

    if (filters.country) where.country = filters.country;
    if (filters.mto) where.mto = filters.mto;
    if (filters.status) where.status = filters.status;
    if (filters.paymentChannel) where.paymentChannel = filters.paymentChannel;
    if (filters.currency) where.currency = filters.currency;
    if (filters.feeType) where.feeType = filters.feeType;

    return await this.corridorsRepository.find({
      where: [
        { ...where, organizationId },
        { ...where, organizationId: IsNull() },
      ],
      order: { createdAt: 'DESC' },
      select: ['id', 'mto', 'country', 'countryName', 'paymentChannel', 'paymentChannelName', 'currency', 'status', 'feeType', 'marginType', 'organizationId', 'createdAt', 'updatedAt'],
      take: limit,
      skip: offset,
    });
  }

  // Fixed Fee Methods
  // Helper: Deactivate all other fee types when switching fee types
  private async deactivateOtherFeeTypes(corridorId: string): Promise<void> {
    await Promise.all([
      this.feesSlabRepository.update({ corridorId }, { isActive: false }),
      this.fixedFeeRepository.update({ corridorId }, { isActive: false }),
      this.timingFeeRepository.update({ corridorId }, { isActive: false }),
      this.bankFeeConfigRepository.update({ corridorId }, { isActive: false }),
    ]);
  }

  // Helper: Deactivate all other margin types when switching margin types
  private async deactivateOtherMarginTypes(corridorId: string): Promise<void> {
    await Promise.all([
      this.marginSlabRepository.update({ corridorId }, { isActive: false }),
      this.fixedMarginRepository.update({ corridorId }, { isActive: false }),
      this.timingMarginRepository.update({ corridorId }, { isActive: false }),
      this.bankMarginConfigRepository.update({ corridorId }, { isActive: false }),
    ]);
  }

  async createFixedFee(corridorId: string, createFixedFeeDto: CreateFixedFeeDto, organizationId: string): Promise<FixedFee> {
    const corridor = await this.findOne(corridorId, organizationId);

    // Deactivate all other fee types before creating new one
    await this.deactivateOtherFeeTypes(corridorId);

    const fixedFee = this.fixedFeeRepository.create({
      ...createFixedFeeDto,
      corridorId,
      isActive: true,
    });
    const saved = await this.fixedFeeRepository.save(fixedFee);

    if (corridor.feeType !== 'fixed_fees' as any) {
      await this.corridorsRepository.update(corridorId, { feeType: 'fixed_fees' as any });
    }
    return saved;
  }

  async getFixedFees(corridorId: string, organizationId: string): Promise<FixedFee[]> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);
    
    return await this.fixedFeeRepository.find({
      where: { corridorId },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteFixedFee(corridorId: string, feeId: string, organizationId: string): Promise<void> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);
    
    const fixedFee = await this.fixedFeeRepository.findOne({
      where: { id: feeId, corridorId },
    });
    
    if (!fixedFee) {
      throw new NotFoundException('Fixed fee not found');
    }
    
    await this.fixedFeeRepository.remove(fixedFee);
  }

  // Fees Slab Methods
  async createFeesSlab(corridorId: string, createFeesSlabDto: CreateFeesSlabDto, organizationId: string): Promise<FeesSlab> {
    const corridor = await this.findOne(corridorId, organizationId);

    // Deactivate all other fee types before creating new one
    await this.deactivateOtherFeeTypes(corridorId);

    const feesSlab = this.feesSlabRepository.create({
      ...createFeesSlabDto,
      corridorId,
      isActive: true,
    });
    const saved = await this.feesSlabRepository.save(feesSlab);

    // Update corridor feeType so quote engine picks it up
    if (corridor.feeType !== 'fees_slab' as any) {
      await this.corridorsRepository.update(corridorId, { feeType: 'fees_slab' as any });
    }
    return saved;
  }

  async getFeeSlabs(corridorId: string, organizationId: string): Promise<FeesSlab[]> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);
    
    return await this.feesSlabRepository.find({
      where: { corridorId },
      order: { minAmount: 'ASC' },
    });
  }

  async deleteFeesSlab(corridorId: string, slabId: string, organizationId: string): Promise<void> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);
    
    const feesSlab = await this.feesSlabRepository.findOne({
      where: { id: slabId, corridorId },
    });
    
    if (!feesSlab) {
      throw new NotFoundException('Fees slab not found');
    }
    
    await this.feesSlabRepository.remove(feesSlab);
  }

  // Bank Fee Config Methods
  async createBankFeeConfig(corridorId: string, createBankFeeConfigDto: CreateBankFeeConfigDto, organizationId: string): Promise<BankFeeConfig> {
    await this.findOne(corridorId, organizationId);
    
    // Deactivate all other fee types before creating new one
    await this.deactivateOtherFeeTypes(corridorId);
    
    // Check if a bank fee config already exists for this bank and currency
    const existingConfig = await this.bankFeeConfigRepository.findOne({
      where: {
        corridorId,
        bankName: createBankFeeConfigDto.bankName,
        currency: createBankFeeConfigDto.currency,
      },
    });

    let bankFeeConfig: BankFeeConfig;
    if (existingConfig) {
      // Update existing config and mark as active
      bankFeeConfig = this.bankFeeConfigRepository.merge(existingConfig, { ...createBankFeeConfigDto, isActive: true });
    } else {
      // Create new config
      bankFeeConfig = this.bankFeeConfigRepository.create({ ...createBankFeeConfigDto, corridorId, isActive: true });
    }
    
    const saved = await this.bankFeeConfigRepository.save(bankFeeConfig);
    await this.corridorsRepository.update(corridorId, { feeType: 'per_bank' as any });
    return saved;
  }

  async getBankFeeConfigs(corridorId: string, organizationId: string): Promise<BankFeeConfig[]> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);
    
    return await this.bankFeeConfigRepository.find({
      where: { corridorId },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteBankFeeConfig(corridorId: string, configId: string, organizationId: string): Promise<void> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);
    
    const bankFeeConfig = await this.bankFeeConfigRepository.findOne({
      where: { id: configId, corridorId },
    });
    
    if (!bankFeeConfig) {
      throw new NotFoundException('Bank fee config not found');
    }
    
    await this.bankFeeConfigRepository.remove(bankFeeConfig);
  }

  // Timing Fee Methods
  async createTimingFee(corridorId: string, createTimingFeeDto: CreateTimingFeeDto, organizationId: string): Promise<TimingFee> {
    const corridor = await this.findOne(corridorId, organizationId);

    // Only deactivate OTHER fee types — do NOT deactivate existing timing_fees
    // so multiple timing slots can all remain active at the same time.
    await Promise.all([
      this.feesSlabRepository.update({ corridorId }, { isActive: false }),
      this.fixedFeeRepository.update({ corridorId }, { isActive: false }),
      this.bankFeeConfigRepository.update({ corridorId }, { isActive: false }),
    ]);

    const timingFee = this.timingFeeRepository.create({
      ...createTimingFeeDto,
      corridorId,
      isActive: true,
    });
    const saved = await this.timingFeeRepository.save(timingFee);

    if (corridor.feeType !== 'timing' as any) {
      await this.corridorsRepository.update(corridorId, { feeType: 'timing' as any });
    }
    return saved;
  }

  async getTimingFees(corridorId: string, organizationId: string): Promise<TimingFee[]> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);
    
    return await this.timingFeeRepository.find({
      where: { corridorId },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteTimingFee(corridorId: string, feeId: string, organizationId: string): Promise<void> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);
    
    const timingFee = await this.timingFeeRepository.findOne({
      where: { id: feeId, corridorId },
    });
    
    if (!timingFee) {
      throw new NotFoundException('Timing fee not found');
    }
    
    await this.timingFeeRepository.remove(timingFee);
  }

  // Fixed Margin Methods
  async createFixedMargin(corridorId: string, createFixedMarginDto: CreateFixedMarginDto, organizationId: string): Promise<FixedMargin> {
    const corridor = await this.findOne(corridorId, organizationId);

    // Deactivate all other margin types before creating new one
    await this.deactivateOtherMarginTypes(corridorId);

    const fixedMargin = this.fixedMarginRepository.create({
      ...createFixedMarginDto,
      corridorId,
      isActive: true,
    });
    const saved = await this.fixedMarginRepository.save(fixedMargin);

    if (corridor.marginType !== 'fixed_margin' as any) {
      await this.corridorsRepository.update(corridorId, { marginType: 'fixed_margin' as any });
    }
    return saved;
  }

  async getFixedMargins(corridorId: string, organizationId: string): Promise<FixedMargin[]> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);
    
    return await this.fixedMarginRepository.find({
      where: { corridorId },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteFixedMargin(corridorId: string, marginId: string, organizationId: string): Promise<void> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);
    
    const fixedMargin = await this.fixedMarginRepository.findOne({
      where: { id: marginId, corridorId },
    });
    
    if (!fixedMargin) {
      throw new NotFoundException('Fixed margin not found');
    }
    
    await this.fixedMarginRepository.remove(fixedMargin);
  }

  // Margin Slab Methods
  async createMarginSlab(corridorId: string, createMarginSlabDto: CreateMarginSlabDto, organizationId: string): Promise<MarginSlab> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);
    // Deactivate other margin types before creating new one
    await this.deactivateOtherMarginTypes(corridorId);

    const marginSlab = this.marginSlabRepository.create({
      ...createMarginSlabDto,
      corridorId,
      isActive: true,
    });
    const saved = await this.marginSlabRepository.save(marginSlab);

    // Update corridor marginType so core engine picks it up
    await this.corridorsRepository.update(corridorId, { marginType: 'margin_slab' as any });
    return saved;
  }

  async getMarginSlabs(corridorId: string, organizationId: string): Promise<MarginSlab[]> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);
    
    return await this.marginSlabRepository.find({
      where: { corridorId },
      order: { minAmount: 'ASC' },
    });
  }

  async deleteMarginSlab(corridorId: string, slabId: string, organizationId: string): Promise<void> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);
    
    const marginSlab = await this.marginSlabRepository.findOne({
      where: { id: slabId, corridorId },
    });
    
    if (!marginSlab) {
      throw new NotFoundException('Margin slab not found');
    }
    
    await this.marginSlabRepository.remove(marginSlab);
  }

  // Bank Margin Config Methods
  async createBankMarginConfig(corridorId: string, createBankMarginConfigDto: CreateBankMarginConfigDto, organizationId: string): Promise<BankMarginConfig> {
    await this.findOne(corridorId, organizationId);
    // Deactivate all other margin types before creating new one
    await this.deactivateOtherMarginTypes(corridorId);

    // Check if a bank margin config already exists for this bank and currency
    const existingConfig = await this.bankMarginConfigRepository.findOne({
      where: {
        corridorId,
        bankName: createBankMarginConfigDto.bankName,
        currency: createBankMarginConfigDto.currency,
      },
    });

    let bankMarginConfig: BankMarginConfig;
    if (existingConfig) {
      // Update existing config and mark as active
      bankMarginConfig = this.bankMarginConfigRepository.merge(existingConfig, { ...createBankMarginConfigDto, isActive: true });
    } else {
      // Create new config
      bankMarginConfig = this.bankMarginConfigRepository.create({ ...createBankMarginConfigDto, corridorId, isActive: true });
    }

    const saved = await this.bankMarginConfigRepository.save(bankMarginConfig);
    await this.corridorsRepository.update(corridorId, { marginType: 'per_bank_margin' as any });
    return saved;
  }

  async getBankMarginConfigs(corridorId: string, organizationId: string): Promise<BankMarginConfig[]> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);
    
    return await this.bankMarginConfigRepository.find({
      where: { corridorId },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteBankMarginConfig(corridorId: string, configId: string, organizationId: string): Promise<void> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);
    
    const bankMarginConfig = await this.bankMarginConfigRepository.findOne({
      where: { id: configId, corridorId },
    });
    
    if (!bankMarginConfig) {
      throw new NotFoundException('Bank margin config not found');
    }
    
    await this.bankMarginConfigRepository.remove(bankMarginConfig);
  }

  // Timing Margin Methods
  async createTimingMargin(corridorId: string, createTimingMarginDto: CreateTimingMarginDto, organizationId: string): Promise<TimingMargin> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);

    // Only deactivate OTHER margin types — do NOT deactivate existing timing_margins
    // so multiple timing slots can all remain active at the same time.
    await Promise.all([
      this.marginSlabRepository.update({ corridorId }, { isActive: false }),
      this.fixedMarginRepository.update({ corridorId }, { isActive: false }),
      this.bankMarginConfigRepository.update({ corridorId }, { isActive: false }),
    ]);

    const timingMargin = this.timingMarginRepository.create({
      ...createTimingMarginDto,
      corridorId,
      isActive: true,
    });
    const saved = await this.timingMarginRepository.save(timingMargin);

    await this.corridorsRepository.update(corridorId, { marginType: 'timing_margin' as any });
    return saved;
  }

  async getTimingMargins(corridorId: string, organizationId: string): Promise<TimingMargin[]> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);
    
    return await this.timingMarginRepository.find({
      where: { corridorId },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteTimingMargin(corridorId: string, marginId: string, organizationId: string): Promise<void> {
    // Verify corridor exists and belongs to organization
    await this.findOne(corridorId, organizationId);
    
    const timingMargin = await this.timingMarginRepository.findOne({
      where: { id: marginId, corridorId },
    });
    
    if (!timingMargin) {
      throw new NotFoundException('Timing margin not found');
    }
    
    await this.timingMarginRepository.remove(timingMargin);
  }
}