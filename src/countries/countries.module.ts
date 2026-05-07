import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountriesController } from './countries.controller';
import { CountriesService } from './services/countries.service';
import { MtoCountry } from './entities/mto-country.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MtoCountry])],
  controllers: [CountriesController],
  providers: [CountriesService],
  exports: [CountriesService],
})
export class CountriesModule {}
