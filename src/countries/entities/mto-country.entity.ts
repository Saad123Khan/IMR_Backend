import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export class Country {
  Name?: string;
  IsoCode?: string;
  HasTown?: string;
}

@Entity('mto_countries')
@Index(['mtoName'], { unique: true })
export class MtoCountry {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @ApiProperty({
    description: 'MTO provider name',
    example: 'thones',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  mtoName?: string;

  @ApiProperty({
    description: 'Array of countries for this MTO',
    type: [Country],
  })
  @Column({ type: 'jsonb', default: [] })
  Countries?: Country[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
