import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorridorsService } from './corridors.service';
import { CorridorsController } from './corridors.controller';
import { Corridor } from './entities/corridor.entity';
import { FixedFee } from './entities/fixed-fee.entity';
import { FeesSlab } from './entities/fees-slab.entity';
import { BankFeeConfig } from './entities/bank-fee-config.entity';
import { TimingFee } from './entities/timing-fee.entity';
import { FixedMargin } from './entities/fixed-margin.entity';
import { MarginSlab } from './entities/margin-slab.entity';
import { TimingMargin } from './entities/timing-margin.entity';
import { BankMarginConfig } from './entities/bank-margin-config.entity';
import { BankPayerMapping } from './entities/bank-payer-mapping.entity';
import { Router } from './entities/router.entity';
import { RoutingRule } from './entities/routing-rule.entity';
import { BankPayerMappingService } from './services/bank-payer-mapping.service';
import { BankPayerMappingController } from './controllers/bank-payer-mapping.controller';
import { RouterService } from './services/router.service';
import { RouterController } from './controllers/router.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
    ]),
  ],
  controllers: [CorridorsController, BankPayerMappingController, RouterController],
  providers: [CorridorsService, BankPayerMappingService, RouterService],
  exports: [CorridorsService, BankPayerMappingService, RouterService],
})
export class CorridorsModule {}
