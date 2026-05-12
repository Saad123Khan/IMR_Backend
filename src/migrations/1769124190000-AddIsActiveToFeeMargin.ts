import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1769124190000 implements MigrationInterface {
    name = 'Migration1769124190000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fixed_fees" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "fees_slabs" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "fixed_margins" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "margin_slabs" ADD "isActive" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "margin_slabs" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "fixed_margins" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "fees_slabs" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "fixed_fees" DROP COLUMN "isActive"`);
    }
}
