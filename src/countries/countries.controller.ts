import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CountriesService } from './services/countries.service';
import { MtoCountry, Country } from './entities/mto-country.entity';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all saved MTO countries' })
  @ApiResponse({
    status: 200,
    description: 'All MTO countries fetched successfully',
  })
  async getAll(): Promise<MtoCountry[]> {
    return this.countriesService.getAllMtoCountries();
  }

  @Get('/:mtoName')
  @ApiOperation({ summary: 'Get countries list for an MTO provider' })
  @ApiResponse({
    status: 200,
    description: 'Countries list fetched successfully',
    schema: {
      type: 'object',
      properties: {
        mtoName: { type: 'string' },
        Countries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              Name: { type: 'string' },
              IsoCode: { type: 'string' },
              HasTown: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getCountries(@Param('mtoName') mtoName: string): Promise<any> {
    return this.countriesService.fetchCountriesFromMock(mtoName);
  }

  @Get('/sync/:mtoName')
  @ApiOperation({ summary: 'Manually sync countries for an MTO provider' })
  @ApiResponse({
    status: 200,
    description: 'Countries synced successfully',
  })
  async syncCountries(@Param('mtoName') mtoName: string): Promise<any> {
    return this.countriesService.syncCountriesForMto(mtoName);
  }
}
