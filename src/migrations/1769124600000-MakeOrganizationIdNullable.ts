import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeOrganizationIdNullable1769124600000 implements MigrationInterface {
  name = 'MakeOrganizationIdNullable1769124600000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "corridors" ALTER COLUMN "organizationId" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "corridors" SET "organizationId" = uuid_generate_v4() WHERE "organizationId" IS NULL`);
    await queryRunner.query(`ALTER TABLE "corridors" ALTER COLUMN "organizationId" SET NOT NULL`);
  }
}
