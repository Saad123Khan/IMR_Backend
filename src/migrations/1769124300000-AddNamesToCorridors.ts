import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNamesToCorridors1769124300000 implements MigrationInterface {
  name = 'AddNamesToCorridors1769124300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "corridors" ADD COLUMN IF NOT EXISTS "countryName" character varying`);
    await queryRunner.query(`ALTER TABLE "corridors" ADD COLUMN IF NOT EXISTS "paymentChannelName" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "corridors" DROP COLUMN IF EXISTS "paymentChannelName"`);
    await queryRunner.query(`ALTER TABLE "corridors" DROP COLUMN IF EXISTS "countryName"`);
  }
}
