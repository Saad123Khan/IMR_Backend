import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RoleService } from './services/role.service';
import { Permission } from '@src/common/enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private organizationsService: OrganizationsService,
    private jwtService: JwtService,
    private roleService: RoleService,
  ) {}

  async signup(signupDto: SignupDto) {
    // Validate that at least email or phone is provided
    if (!signupDto.email && !signupDto.phone) {
      throw new BadRequestException('Either email or phone must be provided');
    }

    // Check if email already exists
    if (signupDto.email) {
      const existingEmail = await this.usersService.findByEmail(signupDto.email);
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check if phone already exists
    if (signupDto.phone) {
      const existingPhone = await this.usersService.findByPhone(signupDto.phone);
      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }
    }

    // Check if organization name already exists
    const existingOrg = await this.organizationsService.findByName(signupDto.organizationName);
    if (existingOrg) {
      throw new ConflictException('Organization name already exists');
    }

    // Create organization
    const organization = await this.organizationsService.create(signupDto.organizationName);

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    // Create a default 'Organization Owner' role for this organization and assign all permissions
    // If you prefer seeding roles during setup, this can be removed.
    const ownerRole = await this.roleService.create({
      name: 'Organization Owner',
      description: 'Owner role with full permissions',
      permissions: Object.values(Permission),
    }, organization.id);

    const user = await this.usersService.create({
      email: signupDto.email,
      phone: signupDto.phone,
      password: hashedPassword,
      name: signupDto.name,
      roleId: ownerRole.id,
      organizationId: organization.id,
    }, true);

    const payload = { sub: user.id };

    // Re-fetch user with relations (role) to include role name/permissions in response
    const userWithRole = await this.usersService.findById(user.id);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userWithRole.id,
        email: userWithRole.email,
        phone: userWithRole.phone,
        name: userWithRole.name,
        roleId: userWithRole.roleId,
        role: userWithRole.role ? userWithRole.role.name : null,
        organizationId: userWithRole.organizationId,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, phone, password } = loginDto;
    
    // Try to find user by email or phone
    let user = email ? await this.usersService.findByEmail(email) : null;
    
    if (!user && phone) {
      user = await this.usersService.findByPhone(phone);
    }

    // SECURITY: Always run bcrypt.compare to prevent timing attacks
    // Use a dummy hash if user not found to keep timing consistent
    const hashToCompare = user?.password || '$2b$10$dummyHashForTimingAttackPrevention1234567890123456789012';
    const isPasswordValid = await bcrypt.compare(password, hashToCompare);
    
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id };

    // Re-fetch user with role relation for response
    const userWithRole = await this.usersService.findById(user.id);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userWithRole.id,
        email: userWithRole.email,
        phone: userWithRole.phone,
        name: userWithRole.name,
        roleId: userWithRole.roleId,
        role: userWithRole.role ? userWithRole.role.name : null,
        organizationId: userWithRole.organizationId,
      },
    };
  }
}