import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Banks')
@ApiBearerAuth('JWT')
@Controller('banks')
@UseGuards(JwtAuthGuard)
export class BanksController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get('by-country/:countryIsoCode')
  @ApiOperation({ summary: 'Get banks by country ISO code (paginated, 10 per page)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getBanksByCountry(
    @Param('countryIsoCode') countryIsoCode: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const isoCode = countryIsoCode.toUpperCase();
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    const rows: Array<{ banks: any[] }> = await this.dataSource.query(
      `SELECT banks FROM mto_banks`,
    );

    const allBanks: any[] = rows
      .flatMap((r) => (Array.isArray(r.banks) ? r.banks : []))
      .filter((b) => b?.CountryIsoCode?.toUpperCase() === isoCode);

    const total = allBanks.length;
    const data = allBanks.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return {
      success: true,
      countryIsoCode: isoCode,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 0,
      data,
    };
  }
}
