import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MtoCountry, Country } from '../entities/mto-country.entity';

@Injectable()
export class CountriesService {
  private readonly logger = new Logger(CountriesService.name);

  private readonly mockCountriesData = {
    thones: {
      mtoName: 'thones',
      Countries: [
        {
          Name: 'AALAND ISLAND',
          IsoCode: 'AX',
          HasTown: 'I',
        },
        {
          Name: 'ABKHAZIA',
          IsoCode: 'AB',
          HasTown: 'I',
        },
        {
          Name: 'AFGHANISTAN',
          IsoCode: 'AF',
          HasTown: 'Y',
        },
        {
          Name: 'ALBANIA',
          IsoCode: 'AL',
          HasTown: 'Y',
        },
        {
          Name: 'PAKISTAN',
          IsoCode: 'PK',
          HasTown: 'Y',
        },
      ],
    },
    reymit: {
      mtoName: 'reymit',
      Countries: [
        {
          Name: 'UNITED STATES',
          IsoCode: 'US',
          HasTown: 'Y',
        },
        {
          Name: 'CANADA',
          IsoCode: 'CA',
          HasTown: 'Y',
        },
        {
          Name: 'MEXICO',
          IsoCode: 'MX',
          HasTown: 'Y',
        },
      ],
    },
    hmoney: {
      mtoName: 'hmoney',
      Countries: [
        {
          Name: 'INDIA',
          IsoCode: 'IN',
          HasTown: 'Y',
        },
        {
          Name: 'UNITED KINGDOM',
          IsoCode: 'UK',
          HasTown: 'Y',
        },
        {
          Name: 'UNITED ARAB EMIRATES',
          IsoCode: 'AE',
          HasTown: 'Y',
        },
      ],
    },
  };

  constructor(
    @InjectRepository(MtoCountry)
    private readonly mtoCountryRepository: Repository<MtoCountry>,
  ) {}

  /**
   * Fetch mock countries data for a specific MTO provider
   */
  async fetchCountriesFromMock(mtoName: string): Promise<any> {
    const mockData = this.mockCountriesData[mtoName.toLowerCase()];
    if (!mockData) {
      return {
        mtoName,
        Countries: [],
        message: 'No mock data found for this MTO provider',
      };
    }
    return mockData;
  }

  /**
   * Sync countries for a specific MTO provider
   */
  async syncCountriesForMto(mtoName: string): Promise<any> {
    try {
      // Fetch data from mock API
      const fetchedData = await this.fetchCountriesFromMock(mtoName);

      if (fetchedData.Countries.length === 0) {
        return {
          success: false,
          message: `No countries data found for MTO: ${mtoName}`,
        };
      }

      // Check if MTO entry exists in database
      let mtoEntry = await this.mtoCountryRepository.findOne({
        where: { mtoName },
      });

      if (!mtoEntry) {
        // Create new entry
        mtoEntry = this.mtoCountryRepository.create({
          mtoName,
          Countries: fetchedData.Countries,
        });
        await this.mtoCountryRepository.save(mtoEntry);
        this.logger.log(`Created new MTO entry for: ${mtoName}`);
        return {
          success: true,
          action: 'created',
          message: `Created new MTO entry for: ${mtoName}`,
          data: mtoEntry,
        };
      }

      // Compare with existing data
      const hasChanged = this.hasCountriesChanged(
        mtoEntry.Countries || [],
        fetchedData.Countries,
      );

      if (!hasChanged) {
        this.logger.log(
          `No changes detected for MTO: ${mtoName}, skipping update`,
        );
        return {
          success: true,
          action: 'skipped',
          message: `No changes detected for MTO: ${mtoName}`,
          data: mtoEntry,
        };
      }

      // Update existing entry
      mtoEntry.Countries = fetchedData.Countries;
      await this.mtoCountryRepository.save(mtoEntry);
      this.logger.log(`Updated countries for MTO: ${mtoName}`);
      return {
        success: true,
        action: 'updated',
        message: `Updated countries for MTO: ${mtoName}`,
        data: mtoEntry,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(
        `Error syncing countries for MTO ${mtoName}:`,
        errorMessage,
      );
      return {
        success: false,
        message: `Error syncing countries: ${errorMessage}`,
      };
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncAllCountriesCronJob() {
    this.logger.debug('Starting countries sync cron job...');
    
    // Get all MTO names from mock data
    const mtoNames = Object.keys(this.mockCountriesData);

    for (const mtoName of mtoNames) {
      const result = await this.syncCountriesForMto(mtoName);
      this.logger.debug(`Sync result for ${mtoName}:`, result);
    }

    this.logger.debug('Completed countries sync cron job');
  }

  /**
   * Compare if countries data has changed
   */
  private hasCountriesChanged(
    oldCountries: Country[],
    newCountries: Country[],
  ): boolean {
    // Check if arrays have different lengths
    if (oldCountries.length !== newCountries.length) {
      return true;
    }

    // Deep comparison of countries
    const oldSorted = JSON.stringify(
      oldCountries.sort((a, b) => (a?.IsoCode || '').localeCompare(b?.IsoCode || '')),
    );
    const newSorted = JSON.stringify(
      newCountries.sort((a, b) => (a?.IsoCode || '').localeCompare(b?.IsoCode || '')),
    );

    return oldSorted !== newSorted;
  }

  /**
   * Get all MTO countries
   */
  async getAllMtoCountries(): Promise<MtoCountry[]> {
    return this.mtoCountryRepository.find();
  }

  /**
   * Get MTO countries by name
   */
  async getMtoCountriesByName(mtoName: string): Promise<MtoCountry | null> {
    return this.mtoCountryRepository.findOne({
      where: { mtoName },
    });
  }
}
