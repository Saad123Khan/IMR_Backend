import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { IsNull } from 'typeorm';

import { CorridorsService } from './corridors.service';
import { Corridor } from './entities/corridor.entity';
import { FixedFee } from './entities/fixed-fee.entity';
import { FeesSlab } from './entities/fees-slab.entity';
import { BankFeeConfig } from './entities/bank-fee-config.entity';
import { TimingFee } from './entities/timing-fee.entity';
import { FixedMargin } from './entities/fixed-margin.entity';
import { MarginSlab } from './entities/margin-slab.entity';
import { TimingMargin } from './entities/timing-margin.entity';
import { BankMarginConfig } from './entities/bank-margin-config.entity';

// ── Mock factory ──────────────────────────────────────────────────────────────
const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
  merge: jest.fn(),
});

// ── Fixtures ──────────────────────────────────────────────────────────────────
const ORG_ID = 'org-001';
const CORRIDOR_ID = 'corr-001';

const baseCorridor = (): Corridor =>
  ({
    id: CORRIDOR_ID,
    mto: 'transfast',
    country: 'PK',
    countryName: 'Pakistan',
    paymentChannel: 'Bank Transfer',
    paymentChannelName: 'Bank Transfer',
    currency: 'PKR',
    status: 'active' as any,
    feeType: 'dynamic' as any,
    marginType: 'dynamic' as any,
    organizationId: ORG_ID,
    defaultTimingFeeValue: 0,
    defaultTimingMarginValue: 0,
  } as Corridor);

// ── Test Suite ────────────────────────────────────────────────────────────────
describe('CorridorsService', () => {
  let service: CorridorsService;
  let corridorRepo: ReturnType<typeof mockRepo>;
  let fixedFeeRepo: ReturnType<typeof mockRepo>;
  let feesSlabRepo: ReturnType<typeof mockRepo>;
  let bankFeeRepo: ReturnType<typeof mockRepo>;
  let timingFeeRepo: ReturnType<typeof mockRepo>;
  let fixedMarginRepo: ReturnType<typeof mockRepo>;
  let marginSlabRepo: ReturnType<typeof mockRepo>;
  let timingMarginRepo: ReturnType<typeof mockRepo>;
  let bankMarginRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CorridorsService,
        { provide: getRepositoryToken(Corridor),        useFactory: mockRepo },
        { provide: getRepositoryToken(FixedFee),        useFactory: mockRepo },
        { provide: getRepositoryToken(FeesSlab),        useFactory: mockRepo },
        { provide: getRepositoryToken(BankFeeConfig),   useFactory: mockRepo },
        { provide: getRepositoryToken(TimingFee),       useFactory: mockRepo },
        { provide: getRepositoryToken(FixedMargin),     useFactory: mockRepo },
        { provide: getRepositoryToken(MarginSlab),      useFactory: mockRepo },
        { provide: getRepositoryToken(TimingMargin),    useFactory: mockRepo },
        { provide: getRepositoryToken(BankMarginConfig),useFactory: mockRepo },
      ],
    }).compile();

    service          = module.get(CorridorsService);
    corridorRepo     = module.get(getRepositoryToken(Corridor));
    fixedFeeRepo     = module.get(getRepositoryToken(FixedFee));
    feesSlabRepo     = module.get(getRepositoryToken(FeesSlab));
    bankFeeRepo      = module.get(getRepositoryToken(BankFeeConfig));
    timingFeeRepo    = module.get(getRepositoryToken(TimingFee));
    fixedMarginRepo  = module.get(getRepositoryToken(FixedMargin));
    marginSlabRepo   = module.get(getRepositoryToken(MarginSlab));
    timingMarginRepo = module.get(getRepositoryToken(TimingMargin));
    bankMarginRepo   = module.get(getRepositoryToken(BankMarginConfig));
  });

  // ── Helper: findOne mock setup ──────────────────────────────────────────────
  const mockFindOne = (corridor = baseCorridor()) =>
    corridorRepo.findOne.mockResolvedValue(corridor);

  const mockFindOneNull = () =>
    corridorRepo.findOne.mockResolvedValue(null);

  // ════════════════════════════════════════════════════════════════════════════
  //  1. CORRIDOR UPDATE
  // ════════════════════════════════════════════════════════════════════════════
  describe('update()', () => {
    it('should update corridor fields (e.g. status)', async () => {
      const corridor = baseCorridor();
      mockFindOne(corridor);
      corridorRepo.save.mockResolvedValue({ ...corridor, status: 'inactive' as any });

      const result = await service.update(CORRIDOR_ID, { status: 'inactive' as any }, ORG_ID);

      expect(corridorRepo.save).toHaveBeenCalled();
      expect(result.status).toBe('inactive');
    });

    it('should throw NotFoundException when corridor not found', async () => {
      mockFindOneNull();
      await expect(service.update(CORRIDOR_ID, { status: 'inactive' as any }, ORG_ID))
        .rejects.toThrow(NotFoundException);
    });

    it('should deactivate old fee configs when feeType changes to fixed_fees', async () => {
      const corridor = { ...baseCorridor(), feeType: 'fees_slab' as any };
      mockFindOne(corridor);
      feesSlabRepo.update.mockResolvedValue({});
      fixedFeeRepo.update.mockResolvedValue({});
      timingFeeRepo.update.mockResolvedValue({});
      bankFeeRepo.update.mockResolvedValue({});
      corridorRepo.save.mockResolvedValue({ ...corridor, feeType: 'fixed_fees' });

      await service.update(CORRIDOR_ID, { feeType: 'fixed_fees' as any }, ORG_ID);

      // fees_slab records should be deactivated
      expect(feesSlabRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      // fixed_fees records should NOT be deactivated (they're the new type)
      expect(fixedFeeRepo.update).not.toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
    });

    it('should deactivate old margin configs when marginType changes to fixed_margin', async () => {
      const corridor = { ...baseCorridor(), marginType: 'margin_slab' as any };
      mockFindOne(corridor);
      marginSlabRepo.update.mockResolvedValue({});
      fixedMarginRepo.update.mockResolvedValue({});
      timingMarginRepo.update.mockResolvedValue({});
      bankMarginRepo.update.mockResolvedValue({});
      corridorRepo.save.mockResolvedValue({ ...corridor, marginType: 'fixed_margin' });

      await service.update(CORRIDOR_ID, { marginType: 'fixed_margin' as any }, ORG_ID);

      expect(marginSlabRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      expect(fixedMarginRepo.update).not.toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
    });

    it('should NOT deactivate fee configs when feeType is unchanged', async () => {
      const corridor = { ...baseCorridor(), feeType: 'fixed_fees' as any };
      mockFindOne(corridor);
      corridorRepo.save.mockResolvedValue({ ...corridor, status: 'inactive' as any });

      await service.update(CORRIDOR_ID, { status: 'inactive' as any }, ORG_ID);

      expect(feesSlabRepo.update).not.toHaveBeenCalled();
      expect(fixedFeeRepo.update).not.toHaveBeenCalled();
    });

    it('should deactivate all other margin types when switching to timing_margin', async () => {
      const corridor = { ...baseCorridor(), marginType: 'fixed_margin' as any };
      mockFindOne(corridor);
      marginSlabRepo.update.mockResolvedValue({});
      fixedMarginRepo.update.mockResolvedValue({});
      timingMarginRepo.update.mockResolvedValue({});
      bankMarginRepo.update.mockResolvedValue({});
      corridorRepo.save.mockResolvedValue({ ...corridor, marginType: 'timing_margin' });

      await service.update(CORRIDOR_ID, { marginType: 'timing_margin' as any }, ORG_ID);

      expect(fixedMarginRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      expect(marginSlabRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      expect(bankMarginRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      // timing_margin records should NOT be deactivated
      expect(timingMarginRepo.update).not.toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  //  2. CORRIDOR DELETE
  // ════════════════════════════════════════════════════════════════════════════
  describe('remove()', () => {
    it('should remove corridor successfully', async () => {
      const corridor = baseCorridor();
      mockFindOne(corridor);
      corridorRepo.remove.mockResolvedValue(undefined);

      await expect(service.remove(CORRIDOR_ID, ORG_ID)).resolves.toBeUndefined();
      expect(corridorRepo.remove).toHaveBeenCalledWith(corridor);
    });

    it('should throw NotFoundException when corridor not found', async () => {
      mockFindOneNull();
      await expect(service.remove(CORRIDOR_ID, ORG_ID)).rejects.toThrow(NotFoundException);
      expect(corridorRepo.remove).not.toHaveBeenCalled();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  //  3. STATUS MAINTENANCE — deactivateOtherFeeTypes
  // ════════════════════════════════════════════════════════════════════════════
  describe('deactivateOtherFeeTypes (via createFixedFee)', () => {
    it('should deactivate slabs, timing_fees, bank_fees when fixed_fees is created', async () => {
      mockFindOne();
      feesSlabRepo.update.mockResolvedValue({});
      timingFeeRepo.update.mockResolvedValue({});
      bankFeeRepo.update.mockResolvedValue({});
      fixedFeeRepo.update.mockResolvedValue({});
      fixedFeeRepo.create.mockReturnValue({ id: 'fee-1', feeAmount: 10 });
      fixedFeeRepo.save.mockResolvedValue({ id: 'fee-1', feeAmount: 10, isActive: true });
      corridorRepo.update.mockResolvedValue({});

      await service.createFixedFee(CORRIDOR_ID, { feeAmount: 10, thresholdAmount: 0, isPercentage: false }, ORG_ID);

      expect(feesSlabRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      expect(timingFeeRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      expect(bankFeeRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      // fixed_fees should NOT be deactivated (it's the new type)
      expect(fixedFeeRepo.update).not.toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
    });

    it('should deactivate fixed_fees, timing_fees, bank_fees when fees_slab is created', async () => {
      mockFindOne();
      fixedFeeRepo.update.mockResolvedValue({});
      timingFeeRepo.update.mockResolvedValue({});
      bankFeeRepo.update.mockResolvedValue({});
      feesSlabRepo.update.mockResolvedValue({});
      feesSlabRepo.create.mockReturnValue({ id: 'slab-1' });
      feesSlabRepo.save.mockResolvedValue({ id: 'slab-1', isActive: true });
      corridorRepo.update.mockResolvedValue({});

      await service.createFeesSlab(CORRIDOR_ID, { minAmount: 0, maxAmount: 500, feeAmount: 5, isPercentage: false }, ORG_ID);

      expect(fixedFeeRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      expect(timingFeeRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      expect(bankFeeRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      // fees_slab records should NOT be deactivated
      expect(feesSlabRepo.update).not.toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
    });

    it('should NOT deactivate other timing_fees when a new timing fee is created (multiple slots allowed)', async () => {
      mockFindOne();
      feesSlabRepo.update.mockResolvedValue({});
      fixedFeeRepo.update.mockResolvedValue({});
      bankFeeRepo.update.mockResolvedValue({});
      timingFeeRepo.create.mockReturnValue({ id: 'tf-1' });
      timingFeeRepo.save.mockResolvedValue({ id: 'tf-1', isActive: true });
      corridorRepo.update.mockResolvedValue({});

      await service.createTimingFee(CORRIDOR_ID, {
        startTime: '09:00', endTime: '17:00',
        feeAmount: 5, isPercentage: false, isActive: true, applicableDays: ['MONDAY'],
      }, ORG_ID);

      // timing_fee siblings should NOT be deactivated
      expect(timingFeeRepo.update).not.toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      // But other types should be deactivated
      expect(feesSlabRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      expect(fixedFeeRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
    });
  });

  describe('deactivateOtherMarginTypes (via createFixedMargin)', () => {
    it('should deactivate slabs, timing_margins, bank_margins when fixed_margin is created', async () => {
      mockFindOne();
      marginSlabRepo.update.mockResolvedValue({});
      timingMarginRepo.update.mockResolvedValue({});
      bankMarginRepo.update.mockResolvedValue({});
      fixedMarginRepo.update.mockResolvedValue({});
      fixedMarginRepo.create.mockReturnValue({ id: 'fm-1' });
      fixedMarginRepo.save.mockResolvedValue({ id: 'fm-1', isActive: true });
      corridorRepo.update.mockResolvedValue({});

      await service.createFixedMargin(CORRIDOR_ID, { marginValue: 1.5, thresholdAmount: 0, isPercentage: true }, ORG_ID);

      expect(marginSlabRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      expect(timingMarginRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      expect(bankMarginRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      expect(fixedMarginRepo.update).not.toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
    });

    it('should NOT deactivate other timing_margins when new timing margin is created', async () => {
      mockFindOne();
      marginSlabRepo.update.mockResolvedValue({});
      fixedMarginRepo.update.mockResolvedValue({});
      bankMarginRepo.update.mockResolvedValue({});
      timingMarginRepo.create.mockReturnValue({ id: 'tm-1' });
      timingMarginRepo.save.mockResolvedValue({ id: 'tm-1', isActive: true });
      corridorRepo.update.mockResolvedValue({});

      await service.createTimingMargin(CORRIDOR_ID, {
        startDate: '2026-01-01', startTime: '09:00', endTime: '17:00',
        marginValue: 1.5, isPercentage: true, isActive: true, applicableDays: ['Monday'],
      }, ORG_ID);

      expect(timingMarginRepo.update).not.toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      expect(fixedMarginRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  //  4. FEES SLAB — UPDATE & DELETE
  // ════════════════════════════════════════════════════════════════════════════
  describe('updateFeesSlab()', () => {
    it('should update slab fields correctly', async () => {
      mockFindOne();
      const slab = { id: 'slab-1', corridorId: CORRIDOR_ID, minAmount: 0, maxAmount: 500, feeAmount: 5, isPercentage: false, isActive: true };
      feesSlabRepo.findOne.mockResolvedValue(slab);
      feesSlabRepo.save.mockResolvedValue({ ...slab, feeAmount: 8 });

      const result = await service.updateFeesSlab(CORRIDOR_ID, 'slab-1', { feeAmount: 8 }, ORG_ID);

      expect(feesSlabRepo.save).toHaveBeenCalled();
      expect(result.feeAmount).toBe(8);
    });

    it('should throw NotFoundException when slab not found', async () => {
      mockFindOne();
      feesSlabRepo.findOne.mockResolvedValue(null);

      await expect(service.updateFeesSlab(CORRIDOR_ID, 'bad-id', { feeAmount: 8 }, ORG_ID))
        .rejects.toThrow(NotFoundException);
    });

    it('should update slab isActive to false (deactivate)', async () => {
      mockFindOne();
      const slab = { id: 'slab-1', corridorId: CORRIDOR_ID, feeAmount: 5, isActive: true };
      feesSlabRepo.findOne.mockResolvedValue(slab);
      feesSlabRepo.save.mockResolvedValue({ ...slab, isActive: false });

      const result = await service.updateFeesSlab(CORRIDOR_ID, 'slab-1', { isActive: false } as any, ORG_ID);

      expect(result.isActive).toBe(false);
    });
  });

  describe('deleteFeesSlab()', () => {
    it('should delete slab successfully', async () => {
      mockFindOne();
      const slab = { id: 'slab-1', corridorId: CORRIDOR_ID };
      feesSlabRepo.findOne.mockResolvedValue(slab);
      feesSlabRepo.remove.mockResolvedValue(undefined);

      await expect(service.deleteFeesSlab(CORRIDOR_ID, 'slab-1', ORG_ID)).resolves.toBeUndefined();
      expect(feesSlabRepo.remove).toHaveBeenCalledWith(slab);
    });

    it('should throw NotFoundException when slab not found', async () => {
      mockFindOne();
      feesSlabRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteFeesSlab(CORRIDOR_ID, 'bad-id', ORG_ID))
        .rejects.toThrow(NotFoundException);
      expect(feesSlabRepo.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when corridor not found', async () => {
      mockFindOneNull();

      await expect(service.deleteFeesSlab(CORRIDOR_ID, 'slab-1', ORG_ID))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  //  5. FIXED FEE — UPDATE & DELETE
  // ════════════════════════════════════════════════════════════════════════════
  describe('updateFixedFee()', () => {
    it('should update fee, set isActive=true, and deactivate other fee types', async () => {
      mockFindOne();
      const fee = { id: 'fee-1', corridorId: CORRIDOR_ID, feeAmount: 10, isActive: false };
      fixedFeeRepo.findOne.mockResolvedValue(fee);
      feesSlabRepo.update.mockResolvedValue({});
      timingFeeRepo.update.mockResolvedValue({});
      bankFeeRepo.update.mockResolvedValue({});
      fixedFeeRepo.update.mockResolvedValue({});
      fixedFeeRepo.save.mockResolvedValue({ ...fee, feeAmount: 20, isActive: true });
      corridorRepo.update.mockResolvedValue({});

      const result = await service.updateFixedFee(CORRIDOR_ID, 'fee-1', { feeAmount: 20 }, ORG_ID);

      expect(result.feeAmount).toBe(20);
      expect(result.isActive).toBe(true);
      // other fee types must be deactivated
      expect(feesSlabRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      expect(timingFeeRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      expect(bankFeeRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
    });

    it('should update corridor feeType to fixed_fees if it was different', async () => {
      const corridor = { ...baseCorridor(), feeType: 'fees_slab' as any };
      mockFindOne(corridor);
      const fee = { id: 'fee-1', corridorId: CORRIDOR_ID, feeAmount: 10, isActive: false };
      fixedFeeRepo.findOne.mockResolvedValue(fee);
      feesSlabRepo.update.mockResolvedValue({});
      timingFeeRepo.update.mockResolvedValue({});
      bankFeeRepo.update.mockResolvedValue({});
      fixedFeeRepo.update.mockResolvedValue({});
      fixedFeeRepo.save.mockResolvedValue({ ...fee, feeAmount: 20, isActive: true });
      corridorRepo.update.mockResolvedValue({});

      await service.updateFixedFee(CORRIDOR_ID, 'fee-1', { feeAmount: 20 }, ORG_ID);

      expect(corridorRepo.update).toHaveBeenCalledWith(CORRIDOR_ID, { feeType: 'fixed_fees' });
    });

    it('should throw NotFoundException when fixed fee not found', async () => {
      mockFindOne();
      fixedFeeRepo.findOne.mockResolvedValue(null);

      await expect(service.updateFixedFee(CORRIDOR_ID, 'bad-id', { feeAmount: 20 }, ORG_ID))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteFixedFee()', () => {
    it('should delete fixed fee successfully', async () => {
      mockFindOne();
      const fee = { id: 'fee-1', corridorId: CORRIDOR_ID };
      fixedFeeRepo.findOne.mockResolvedValue(fee);
      fixedFeeRepo.remove.mockResolvedValue(undefined);

      await expect(service.deleteFixedFee(CORRIDOR_ID, 'fee-1', ORG_ID)).resolves.toBeUndefined();
      expect(fixedFeeRepo.remove).toHaveBeenCalledWith(fee);
    });

    it('should throw NotFoundException when fee not found', async () => {
      mockFindOne();
      fixedFeeRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteFixedFee(CORRIDOR_ID, 'bad-id', ORG_ID))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  //  6. MARGIN SLAB — UPDATE & DELETE
  // ════════════════════════════════════════════════════════════════════════════
  describe('updateMarginSlab()', () => {
    it('should update margin slab values', async () => {
      mockFindOne();
      const slab = { id: 'ms-1', corridorId: CORRIDOR_ID, marginValue: 1.5, isActive: true };
      marginSlabRepo.findOne.mockResolvedValue(slab);
      marginSlabRepo.save.mockResolvedValue({ ...slab, marginValue: 2.0 });

      const result = await service.updateMarginSlab(CORRIDOR_ID, 'ms-1', { marginValue: 2.0 }, ORG_ID);

      expect(result.marginValue).toBe(2.0);
    });

    it('should throw NotFoundException when margin slab not found', async () => {
      mockFindOne();
      marginSlabRepo.findOne.mockResolvedValue(null);

      await expect(service.updateMarginSlab(CORRIDOR_ID, 'bad-id', { marginValue: 2 }, ORG_ID))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteMarginSlab()', () => {
    it('should delete margin slab successfully', async () => {
      mockFindOne();
      const slab = { id: 'ms-1', corridorId: CORRIDOR_ID };
      marginSlabRepo.findOne.mockResolvedValue(slab);
      marginSlabRepo.remove.mockResolvedValue(undefined);

      await expect(service.deleteMarginSlab(CORRIDOR_ID, 'ms-1', ORG_ID)).resolves.toBeUndefined();
      expect(marginSlabRepo.remove).toHaveBeenCalledWith(slab);
    });

    it('should throw NotFoundException when margin slab not found', async () => {
      mockFindOne();
      marginSlabRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteMarginSlab(CORRIDOR_ID, 'bad-id', ORG_ID))
        .rejects.toThrow(NotFoundException);
      expect(marginSlabRepo.remove).not.toHaveBeenCalled();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  //  7. FIXED MARGIN — UPDATE & DELETE
  // ════════════════════════════════════════════════════════════════════════════
  describe('updateFixedMargin()', () => {
    it('should update margin, set isActive=true, and deactivate other margin types', async () => {
      mockFindOne();
      const margin = { id: 'fm-1', corridorId: CORRIDOR_ID, marginValue: 1.5, isActive: false };
      fixedMarginRepo.findOne.mockResolvedValue(margin);
      marginSlabRepo.update.mockResolvedValue({});
      timingMarginRepo.update.mockResolvedValue({});
      bankMarginRepo.update.mockResolvedValue({});
      fixedMarginRepo.update.mockResolvedValue({});
      fixedMarginRepo.save.mockResolvedValue({ ...margin, marginValue: 2.0, isActive: true });
      corridorRepo.update.mockResolvedValue({});

      const result = await service.updateFixedMargin(CORRIDOR_ID, 'fm-1', { marginValue: 2.0 }, ORG_ID);

      expect(result.marginValue).toBe(2.0);
      expect(result.isActive).toBe(true);
      // other margin types must be deactivated — only fixed_margin stays active
      expect(marginSlabRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      expect(timingMarginRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
      expect(bankMarginRepo.update).toHaveBeenCalledWith({ corridorId: CORRIDOR_ID }, { isActive: false });
    });

    it('should update corridor marginType to fixed_margin if it was different', async () => {
      const corridor = { ...baseCorridor(), marginType: 'margin_slab' as any };
      mockFindOne(corridor);
      const margin = { id: 'fm-1', corridorId: CORRIDOR_ID, marginValue: 1.5, isActive: false };
      fixedMarginRepo.findOne.mockResolvedValue(margin);
      marginSlabRepo.update.mockResolvedValue({});
      timingMarginRepo.update.mockResolvedValue({});
      bankMarginRepo.update.mockResolvedValue({});
      fixedMarginRepo.update.mockResolvedValue({});
      fixedMarginRepo.save.mockResolvedValue({ ...margin, isActive: true });
      corridorRepo.update.mockResolvedValue({});

      await service.updateFixedMargin(CORRIDOR_ID, 'fm-1', { marginValue: 2.0 }, ORG_ID);

      expect(corridorRepo.update).toHaveBeenCalledWith(CORRIDOR_ID, { marginType: 'fixed_margin' });
    });

    it('should throw NotFoundException when fixed margin not found', async () => {
      mockFindOne();
      fixedMarginRepo.findOne.mockResolvedValue(null);

      await expect(service.updateFixedMargin(CORRIDOR_ID, 'bad-id', { marginValue: 2 }, ORG_ID))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteFixedMargin()', () => {
    it('should delete fixed margin successfully', async () => {
      mockFindOne();
      const margin = { id: 'fm-1', corridorId: CORRIDOR_ID };
      fixedMarginRepo.findOne.mockResolvedValue(margin);
      fixedMarginRepo.remove.mockResolvedValue(undefined);

      await expect(service.deleteFixedMargin(CORRIDOR_ID, 'fm-1', ORG_ID)).resolves.toBeUndefined();
      expect(fixedMarginRepo.remove).toHaveBeenCalledWith(margin);
    });

    it('should throw NotFoundException when margin not found', async () => {
      mockFindOne();
      fixedMarginRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteFixedMargin(CORRIDOR_ID, 'bad-id', ORG_ID))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  //  8. TIMING FEE — UPDATE & DELETE
  // ════════════════════════════════════════════════════════════════════════════
  describe('updateTimingFee()', () => {
    it('should update timing fee fields', async () => {
      mockFindOne();
      const fee = { id: 'tf-1', corridorId: CORRIDOR_ID, feeAmount: 5, startTime: '09:00', endTime: '17:00', isActive: true };
      timingFeeRepo.findOne.mockResolvedValue(fee);
      timingFeeRepo.save.mockResolvedValue({ ...fee, feeAmount: 8 });

      const result = await service.updateTimingFee(CORRIDOR_ID, 'tf-1', { feeAmount: 8 }, ORG_ID);

      expect(result.feeAmount).toBe(8);
    });

    it('should throw NotFoundException when timing fee not found', async () => {
      mockFindOne();
      timingFeeRepo.findOne.mockResolvedValue(null);

      await expect(service.updateTimingFee(CORRIDOR_ID, 'bad-id', { feeAmount: 8 }, ORG_ID))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTimingFee()', () => {
    it('should delete timing fee successfully', async () => {
      mockFindOne();
      const fee = { id: 'tf-1', corridorId: CORRIDOR_ID };
      timingFeeRepo.findOne.mockResolvedValue(fee);
      timingFeeRepo.remove.mockResolvedValue(undefined);

      await expect(service.deleteTimingFee(CORRIDOR_ID, 'tf-1', ORG_ID)).resolves.toBeUndefined();
      expect(timingFeeRepo.remove).toHaveBeenCalledWith(fee);
    });

    it('should throw NotFoundException when timing fee not found', async () => {
      mockFindOne();
      timingFeeRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteTimingFee(CORRIDOR_ID, 'bad-id', ORG_ID))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  //  9. TIMING MARGIN — UPDATE & DELETE
  // ════════════════════════════════════════════════════════════════════════════
  describe('updateTimingMargin()', () => {
    it('should update timing margin fields', async () => {
      mockFindOne();
      const margin = { id: 'tm-1', corridorId: CORRIDOR_ID, marginValue: 1.5, isActive: true };
      timingMarginRepo.findOne.mockResolvedValue(margin);
      timingMarginRepo.save.mockResolvedValue({ ...margin, marginValue: 2.0 });

      const result = await service.updateTimingMargin(CORRIDOR_ID, 'tm-1', { marginValue: 2.0 }, ORG_ID);

      expect(result.marginValue).toBe(2.0);
    });

    it('should throw NotFoundException when timing margin not found', async () => {
      mockFindOne();
      timingMarginRepo.findOne.mockResolvedValue(null);

      await expect(service.updateTimingMargin(CORRIDOR_ID, 'bad-id', { marginValue: 2 }, ORG_ID))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTimingMargin()', () => {
    it('should delete timing margin successfully', async () => {
      mockFindOne();
      const margin = { id: 'tm-1', corridorId: CORRIDOR_ID };
      timingMarginRepo.findOne.mockResolvedValue(margin);
      timingMarginRepo.remove.mockResolvedValue(undefined);

      await expect(service.deleteTimingMargin(CORRIDOR_ID, 'tm-1', ORG_ID)).resolves.toBeUndefined();
      expect(timingMarginRepo.remove).toHaveBeenCalledWith(margin);
    });

    it('should throw NotFoundException when timing margin not found', async () => {
      mockFindOne();
      timingMarginRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteTimingMargin(CORRIDOR_ID, 'bad-id', ORG_ID))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  //  10. CORRIDOR feeType/marginType auto-update
  // ════════════════════════════════════════════════════════════════════════════
  describe('corridor feeType auto-update on slab creation', () => {
    it('should update corridor feeType to fees_slab when first slab is added', async () => {
      const corridor = { ...baseCorridor(), feeType: 'dynamic' as any };
      mockFindOne(corridor);
      fixedFeeRepo.update.mockResolvedValue({});
      timingFeeRepo.update.mockResolvedValue({});
      bankFeeRepo.update.mockResolvedValue({});
      feesSlabRepo.update.mockResolvedValue({});
      feesSlabRepo.create.mockReturnValue({ id: 'slab-1' });
      feesSlabRepo.save.mockResolvedValue({ id: 'slab-1', isActive: true });
      corridorRepo.update.mockResolvedValue({});

      await service.createFeesSlab(CORRIDOR_ID, { minAmount: 0, maxAmount: 500, feeAmount: 5, isPercentage: false }, ORG_ID);

      expect(corridorRepo.update).toHaveBeenCalledWith(CORRIDOR_ID, { feeType: 'fees_slab' });
    });

    it('should update corridor marginType to margin_slab when first margin slab is added', async () => {
      mockFindOne();
      marginSlabRepo.update.mockResolvedValue({});
      fixedMarginRepo.update.mockResolvedValue({});
      timingMarginRepo.update.mockResolvedValue({});
      bankMarginRepo.update.mockResolvedValue({});
      marginSlabRepo.create.mockReturnValue({ id: 'ms-1' });
      marginSlabRepo.save.mockResolvedValue({ id: 'ms-1', isActive: true });
      corridorRepo.update.mockResolvedValue({});

      await service.createMarginSlab(CORRIDOR_ID, { minAmount: 0, maxAmount: 1000, marginValue: 1.5, isPercentage: true }, ORG_ID);

      expect(corridorRepo.update).toHaveBeenCalledWith(CORRIDOR_ID, { marginType: 'margin_slab' });
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  //  11. BANK FEE CONFIG — upsert & delete
  // ════════════════════════════════════════════════════════════════════════════
  describe('createBankFeeConfig() upsert', () => {
    it('should update existing bank fee config when duplicate bank+currency exists', async () => {
      mockFindOne();
      feesSlabRepo.update.mockResolvedValue({});
      fixedFeeRepo.update.mockResolvedValue({});
      timingFeeRepo.update.mockResolvedValue({});
      bankFeeRepo.update.mockResolvedValue({});

      const existing = { id: 'bfc-1', corridorId: CORRIDOR_ID, bankName: 'MCB', currency: 'PKR', bankFeeAmount: 10 };
      bankFeeRepo.findOne.mockResolvedValue(existing);
      bankFeeRepo.merge.mockReturnValue({ ...existing, bankFeeAmount: 20, isActive: true });
      bankFeeRepo.save.mockResolvedValue({ ...existing, bankFeeAmount: 20, isActive: true });
      corridorRepo.update.mockResolvedValue({});

      const result = await service.createBankFeeConfig(
        CORRIDOR_ID,
        { bankName: 'MCB', currency: 'PKR', bankFeeAmount: 20, isPercentage: false, isActive: true },
        ORG_ID,
      );

      expect(bankFeeRepo.merge).toHaveBeenCalled();
      expect(result.bankFeeAmount).toBe(20);
      expect(result.isActive).toBe(true);
    });

    it('should create new bank fee config when no duplicate exists', async () => {
      mockFindOne();
      feesSlabRepo.update.mockResolvedValue({});
      fixedFeeRepo.update.mockResolvedValue({});
      timingFeeRepo.update.mockResolvedValue({});
      bankFeeRepo.update.mockResolvedValue({});
      bankFeeRepo.findOne.mockResolvedValue(null);
      bankFeeRepo.create.mockReturnValue({ id: 'bfc-new', bankName: 'HBL', currency: 'PKR', bankFeeAmount: 15 });
      bankFeeRepo.save.mockResolvedValue({ id: 'bfc-new', bankFeeAmount: 15, isActive: true });
      corridorRepo.update.mockResolvedValue({});

      const result = await service.createBankFeeConfig(
        CORRIDOR_ID,
        { bankName: 'HBL', currency: 'PKR', bankFeeAmount: 15, isPercentage: false, isActive: true },
        ORG_ID,
      );

      expect(bankFeeRepo.create).toHaveBeenCalled();
      expect(result.isActive).toBe(true);
    });
  });

  describe('deleteBankFeeConfig()', () => {
    it('should delete bank fee config successfully', async () => {
      mockFindOne();
      const config = { id: 'bfc-1', corridorId: CORRIDOR_ID };
      bankFeeRepo.findOne.mockResolvedValue(config);
      bankFeeRepo.remove.mockResolvedValue(undefined);

      await expect(service.deleteBankFeeConfig(CORRIDOR_ID, 'bfc-1', ORG_ID)).resolves.toBeUndefined();
      expect(bankFeeRepo.remove).toHaveBeenCalledWith(config);
    });

    it('should throw NotFoundException when config not found', async () => {
      mockFindOne();
      bankFeeRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteBankFeeConfig(CORRIDOR_ID, 'bad-id', ORG_ID))
        .rejects.toThrow(NotFoundException);
    });
  });
});
