import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';
import { User } from '@src/users/entities/user.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createRoleDto: CreateRoleDto, organizationId: string): Promise<Role> {
    // Check if role with same name already exists in organization
    const existing = await this.roleRepository.findOne({
      where: {
        name: createRoleDto.name,
        organizationId,
      },
    });

    if (existing) {
      throw new ConflictException(`Role "${createRoleDto.name}" already exists in your organization`);
    }

    const role = this.roleRepository.create({
      ...createRoleDto,
      organizationId,
    });

    return await this.roleRepository.save(role);
  }

  async findAll(organizationId: string): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { organizationId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, organizationId: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id, organizationId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, organizationId: string): Promise<Role> {
    const role = await this.findById(id, organizationId);

    // Check if new name conflicts with other roles
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existing = await this.roleRepository.findOne({
        where: {
          name: updateRoleDto.name,
          organizationId,
        },
      });

      if (existing) {
        throw new ConflictException(`Role "${updateRoleDto.name}" already exists`);
      }
    }

    Object.assign(role, updateRoleDto);
    return await this.roleRepository.save(role);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const role = await this.findById(id, organizationId);
    
    // Check if any users are assigned to this role
    const usersWithRole = await this.userRepository.count({
      where: { roleId: id },
    });

    if (usersWithRole > 0) {
      throw new BadRequestException(
        `Cannot delete role "${role.name}". ${usersWithRole} user(s) are currently assigned to this role. Please reassign them to a different role before deleting.`
      );
    }

    await this.roleRepository.remove(role);
  }
}
