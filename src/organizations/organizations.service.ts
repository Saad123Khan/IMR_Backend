import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
  ) {}

  async create(name: string, description?: string): Promise<Organization> {
    const organization = this.organizationsRepository.create({ name, description });
    return await this.organizationsRepository.save(organization);
  }

  async findById(id: string): Promise<Organization> {
    const organization = await this.organizationsRepository.findOne({ 
      where: { id },
      relations: ['users'],
    });
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  async findByName(name: string): Promise<Organization | null> {
    return await this.organizationsRepository.findOne({ where: { name } });
  }
}