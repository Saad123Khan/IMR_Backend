import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeMtoToVarchar1769124400000 implements MigrationInterface {
  name = 'ChangeMtoToVarchar1769124400000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "corridors" ALTER COLUMN "mto" TYPE character varying USING "mto"::text`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."corridors_mto_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."corridors_mto_enum" AS ENUM('western_union','moneygram','mastercard')`);
    await queryRunner.query(`ALTER TABLE "corridors" ALTER COLUMN "mto" TYPE "public"."corridors_mto_enum" USING "mto"::"public"."corridors_mto_enum"`);
  }
}
