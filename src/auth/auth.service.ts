import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { Organization } from '../organizations/entities/organization.entity';
import { Role } from './entities/role.entity';
import { User } from '../users/entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RoleService } from './services/role.service';
import { PasswordReset } from './entities/password-reset.entity';
import { MailService } from '../mail/mail.service';
import { Permission } from '@src/common/enums';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private organizationsService: OrganizationsService,
    private jwtService: JwtService,
    private roleService: RoleService,
    private mailService: MailService,
    @InjectRepository(PasswordReset)
    private passwordResetRepo: Repository<PasswordReset>,
    private dataSource: DataSource,
  ) {}

  async signup(signupDto: SignupDto) {
    if (!signupDto.email && !signupDto.phone) {
      throw new BadRequestException('Either email or phone must be provided');
    }

    if (signupDto.email) {
      const existingEmail = await this.usersService.findByEmail(signupDto.email);
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    if (signupDto.phone) {
      const existingPhone = await this.usersService.findByPhone(signupDto.phone);
      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }
    }

    const existingOrg = await this.organizationsService.findByName(signupDto.organizationName);
    if (existingOrg) {
      throw new ConflictException('Organization name already exists');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    const { userId } = await this.dataSource.transaction(async (manager) => {
      const org = manager.create(Organization, { name: signupDto.organizationName });
      const savedOrg = await manager.save(Organization, org);

      const role = manager.create(Role, {
        name: 'Organization Owner',
        description: 'Owner role with full permissions',
        permissions: Object.values(Permission),
        organizationId: savedOrg.id,
      });
      const savedRole = await manager.save(Role, role);

      const user = manager.create(User, {
        email: signupDto.email,
        phone: signupDto.phone,
        password: hashedPassword,
        name: signupDto.name,
        roleId: savedRole.id,
        organizationId: savedOrg.id,
      });
      const savedUser = await manager.save(User, user);
      return { userId: savedUser.id };
    });

    const userWithRole = await this.usersService.findById(userId);

    return {
      access_token: this.jwtService.sign({ sub: userId }),
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

    let user = email ? await this.usersService.findByEmail(email) : null;
    if (!user && phone) {
      user = await this.usersService.findByPhone(phone);
    }

    // SECURITY: Always run bcrypt.compare to prevent timing attacks
    const hashToCompare = user?.password || '$2b$10$dummyHashForTimingAttackPrevention1234567890123456789012';
    const isPasswordValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userWithRole = await this.usersService.findById(user.id);

    return {
      access_token: this.jwtService.sign({ sub: user.id }),
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

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;
    // SECURITY: always return the same response to prevent email enumeration
    const genericResponse = { message: 'If that email is registered, a password reset link has been sent.' };

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return genericResponse;
    }

    // Invalidate any previous unused tokens for this user
    await this.passwordResetRepo.update(
      { userId: user.id, used: false },
      { used: true },
    );

    // Generate a secure random token (sent to user) and store only its hash
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(plainToken, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.passwordResetRepo.save({
      userId: user.id,
      tokenHash,
      expiresAt,
      used: false,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${plainToken}&email=${encodeURIComponent(email)}`;

    try {
      await this.mailService.sendPasswordResetEmail(email, user.name, resetUrl);
    } catch (mailError) {
      // Log but don't expose mail failures to the caller
      console.error('Failed to send password reset email:', (mailError as Error)?.message ?? mailError);
    }

    return genericResponse;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { email, token, newPassword } = dto;
    const invalidError = new BadRequestException('Invalid or expired password reset token');

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw invalidError;
    }

    // Fetch all unused, non-expired tokens for this user
    const resets = await this.passwordResetRepo
      .createQueryBuilder('pr')
      .where('pr.userId = :userId', { userId: user.id })
      .andWhere('pr.used = false')
      .andWhere('pr.expiresAt > :now', { now: new Date() })
      .orderBy('pr.createdAt', 'DESC')
      .getMany();

    let matched: PasswordReset | null = null;
    for (const reset of resets) {
      const isMatch = await bcrypt.compare(token, reset.tokenHash);
      if (isMatch) {
        matched = reset;
        break;
      }
    }

    if (!matched) {
      throw invalidError;
    }

    // Use a transaction: mark token used and update password atomically
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.dataSource.transaction(async manager => {
      await manager.getRepository(PasswordReset).update(matched.id, { used: true });
      await manager.getRepository(User).update(user.id, { password: hashedPassword });
    });

    return { message: 'Password has been reset successfully. You can now log in with your new password.' };
  }
}
