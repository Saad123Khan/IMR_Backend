import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePaymentChannelToVarchar1769124500000 implements MigrationInterface {
  name = 'ChangePaymentChannelToVarchar1769124500000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "corridors" ALTER COLUMN "paymentChannel" TYPE character varying USING "paymentChannel"::text`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."corridors_paymentchannel_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."corridors_paymentchannel_enum" AS ENUM('bank','wallet','cash_pickup')`);
    await queryRunner.query(`ALTER TABLE "corridors" ALTER COLUMN "paymentChannel" TYPE "public"."corridors_paymentchannel_enum" USING "paymentChannel"::"public"."corridors_paymentchannel_enum"`);
  }
}
