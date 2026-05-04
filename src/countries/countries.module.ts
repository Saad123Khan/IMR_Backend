import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CountriesController } from './countries.controller';
import { CountriesService } from './services/countries.service';
import { MtoCountry } from './entities/mto-country.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MtoCountry]), ScheduleModule.forRoot()],
  controllers: [CountriesController],
  providers: [CountriesService],
  exports: [CountriesService],
})
export class CountriesModule {}
