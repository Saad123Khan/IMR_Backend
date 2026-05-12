import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import all entities
import { User } from './users/entities/user.entity';
import { Organization } from './organizations/entities/organization.entity';
import { Role } from './auth/entities/role.entity';
import { Corridor } from './corridors/entities/corridor.entity';
import { FixedFee } from './corridors/entities/fixed-fee.entity';
import { FeesSlab } from './corridors/entities/fees-slab.entity';
import { BankFeeConfig } from './corridors/entities/bank-fee-config.entity';
import { TimingFee } from './corridors/entities/timing-fee.entity';
import { FixedMargin } from './corridors/entities/fixed-margin.entity';
import { MarginSlab } from './corridors/entities/margin-slab.entity';
import { TimingMargin } from './corridors/entities/timing-margin.entity';
import { BankMarginConfig } from './corridors/entities/bank-margin-config.entity';
import { BankPayerMapping } from './corridors/entities/bank-payer-mapping.entity';
import { Router } from './corridors/entities/router.entity';
import { RoutingRule } from './corridors/entities/routing-rule.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'remit_db2',
  synchronize: false, // Always use migrations for schema changes
  logging: process.env.DB_LOGGING === 'true',
  entities: [
    User,
    Organization,
    Role,
    Corridor,
    FixedFee,
    FeesSlab,
    BankFeeConfig,
    TimingFee,
    FixedMargin,
    MarginSlab,
    TimingMargin,
    BankMarginConfig,
    BankPayerMapping,
    Router,
    RoutingRule,
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
