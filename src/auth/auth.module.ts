import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Role } from './entities/role.entity';
import { User } from '../users/entities/user.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { RoleService } from './services/role.service';
import { RoleController } from './controllers/role.controller';
import { MailModule } from '../mail/mail.module';
import type { StringValue } from 'ms';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, User, PasswordReset]),
    UsersModule,
    PassportModule,
    OrganizationsModule,
    MailModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<StringValue>('JWT_EXPIRES_IN', '24h'),
        },
      }),
    }),
  ],
  controllers: [AuthController, RoleController],
  providers: [AuthService, JwtStrategy, RoleService],
  exports: [AuthService, RoleService],
})
export class AuthModule {}
