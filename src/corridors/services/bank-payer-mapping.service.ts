import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankPayerMapping } from '../entities/bank-payer-mapping.entity';
import { CreateBankPayerMappingDto, UpdateBankPayerMappingDto } from '../dto/bank-payer-mapping.dto';
import { MTOProvider } from '@src/common/enums';

@Injectable()
export class BankPayerMappingService {
  constructor(
    @InjectRepository(BankPayerMapping)
    private bankPayerMappingRepository: Repository<BankPayerMapping>,
  ) {}

  async create(
    createDto: CreateBankPayerMappingDto,
    organizationId: string,
  ): Promise<BankPayerMapping> {
    // Check if mapping already exists
    const existing = await this.bankPayerMappingRepository.findOne({
      where: {
        bankName: createDto.bankName,
        mto: createDto.mto,
        organizationId,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Payer mapping for ${createDto.bankName} and ${createDto.mto} already exists`,
      );
    }

    const mapping = this.bankPayerMappingRepository.create({
      ...createDto,
      organizationId,
    });

    return this.bankPayerMappingRepository.save(mapping);
  }

  async findById(id: string, organizationId: string): Promise<BankPayerMapping> {
    const mapping = await this.bankPayerMappingRepository.findOne({
      where: { id, organizationId },
    });

    if (!mapping) {
      throw new NotFoundException('Bank payer mapping not found');
    }

    return mapping;
  }

  async findByBankAndMto(
    bankName: string,
    mto: MTOProvider,
    organizationId: string,
  ): Promise<BankPayerMapping> {
    const mapping = await this.bankPayerMappingRepository.findOne({
      where: {
        bankName,
        mto,
        organizationId,
        isActive: true,
      },
    });

    if (!mapping) {
      throw new NotFoundException(
        `Payer mapping for ${bankName} and ${mto} not found`,
      );
    }

    return mapping;
  }

  async findByBank(
    bankName: string,
    organizationId: string,
  ): Promise<BankPayerMapping[]> {
    return this.bankPayerMappingRepository.find({
      where: {
        bankName,
        organizationId,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async searchByBankName(
    bankName: string,
    organizationId: string,
  ): Promise<BankPayerMapping[]> {
    return this.bankPayerMappingRepository
      .createQueryBuilder('mapping')
      .where('mapping.organizationId = :organizationId', { organizationId })
      .andWhere('LOWER(mapping.bankName) LIKE LOWER(:bankName)', {
        bankName: `%${bankName}%`,
      })
      .orderBy('mapping.bankName', 'ASC')
      .addOrderBy('mapping.mto', 'ASC')
      .getMany();
  }

  async findByOrganization(organizationId: string): Promise<BankPayerMapping[]> {
    return this.bankPayerMappingRepository.find({
      where: { organizationId },
      order: { bankName: 'ASC', mto: 'ASC' },
    });
  }

  async findByMto(
    mto: MTOProvider,
    organizationId: string,
  ): Promise<BankPayerMapping[]> {
    return this.bankPayerMappingRepository.find({
      where: {
        mto,
        organizationId,
      },
      order: { bankName: 'ASC' },
    });
  }

  async update(
    id: string,
    updateDto: UpdateBankPayerMappingDto,
    organizationId: string,
  ): Promise<BankPayerMapping> {
    const mapping = await this.findById(id, organizationId);

    // Check for duplicate if bank and MTO are being updated
    if (updateDto.bankName || updateDto.mto) {
      const bankName = updateDto.bankName || mapping.bankName;
      const mto = updateDto.mto || mapping.mto;

      if (bankName !== mapping.bankName || mto !== mapping.mto) {
        const existing = await this.bankPayerMappingRepository.findOne({
          where: {
            bankName,
            mto,
            organizationId,
          },
        });

        if (existing && existing.id !== id) {
          throw new ConflictException(
            `Payer mapping for ${bankName} and ${mto} already exists`,
          );
        }
      }
    }

    Object.assign(mapping, updateDto);
    return this.bankPayerMappingRepository.save(mapping);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const mapping = await this.findById(id, organizationId);
    await this.bankPayerMappingRepository.remove(mapping);
  }
}
