import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>, isSignup: boolean = false): Promise<User> {
    // Default role concept removed — role assignment should use `roleId` (custom roles)
    
    // SECURITY: Validate roleId belongs to same organization
    if (!isSignup && userData.roleId && userData.organizationId) {
      const role = await this.usersRepository.manager.findOne('Role', {
        where: { id: userData.roleId, organizationId: userData.organizationId },
      });
      if (!role) {
        throw new ForbiddenException('Cannot assign role from another organization');
      }
    }
    
    const user = this.usersRepository.create(userData);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      select: ['id', 'email', 'phone', 'name', 'role', 'isActive', 'organizationId', 'createdAt', 'updatedAt'],
    });
  }

  async findByOrganization(organizationId: string): Promise<User[]> {
    return await this.usersRepository.find({
      where: { organizationId },
      select: ['id', 'email', 'phone', 'name', 'role', 'isActive', 'createdAt', 'updatedAt'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByIdInOrganization(id: string, organizationId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id, organizationId } 
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found in your organization`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findByEmailInOrganization(email: string, organizationId: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email, organizationId } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { phone } });
  }

  async findByPhoneInOrganization(phone: string, organizationId: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { phone, organizationId } });
  }

  async update(id: string, updateData: UpdateEmployeeDto, requestingUserId: string, requestingUserOrganizationId: string): Promise<User> {
    const user = await this.findByIdInOrganization(id, requestingUserOrganizationId);
    
    // Explicitly update each field to ensure TypeORM tracks changes
    if (updateData.name !== undefined) {
      user.name = updateData.name;
    }
    if (updateData.roleId !== undefined) {
      // SECURITY: Validate roleId belongs to same organization
      const role = await this.usersRepository.manager.findOne('Role', {
        where: { id: updateData.roleId, organizationId: requestingUserOrganizationId },
      });
      if (!role) {
        throw new ForbiddenException('Cannot assign role from another organization');
      }
      user.roleId = updateData.roleId;
    }
    if (updateData.isActive !== undefined) {
      user.isActive = updateData.isActive;
    }
    
    const updatedUser = await this.usersRepository.save(user);
    
    // Return the updated user directly without loading relations
    // to preserve the roleId field in the response
    return updatedUser;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.usersRepository.update(id, { password: hashedPassword });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(userId, { password: hashedPassword });
  }

  async remove(id: string, requestingUserId: string, requestingUserOrganizationId: string): Promise<void> {
    const user = await this.findById(id);
    
    // Prevent deleting yourself
    if (user.id === requestingUserId) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    
    // Check if user belongs to the same organization
    if (user.organizationId !== requestingUserOrganizationId) {
      throw new ForbiddenException('You can only delete users in your organization');
    }
    
    await this.usersRepository.remove(user);
  }
}