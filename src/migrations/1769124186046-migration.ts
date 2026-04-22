import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1769124186046 implements MigrationInterface {
    name = 'Migration1769124186046'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "fees_slabs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "corridorId" uuid NOT NULL, "minAmount" numeric(15,2) NOT NULL, "maxAmount" numeric(15,2) NOT NULL, "feeAmount" numeric(10,2) NOT NULL, "isPercentage" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4450eb87d41e63443c29d8f4c27" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "fixed_fees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "corridorId" uuid NOT NULL, "thresholdAmount" numeric(15,2) NOT NULL, "feeAmount" numeric(10,2) NOT NULL, "isPercentage" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3ee07684ba75d51e8262bcad623" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bank_fee_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "corridorId" uuid NOT NULL, "bankName" character varying NOT NULL, "currency" character varying NOT NULL, "bankFeeAmount" numeric(10,2) NOT NULL, "isPercentage" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9dd76ecc5122900c0d5562df732" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "timing_fees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "corridorId" uuid NOT NULL, "startDate" date, "endDate" date, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "applicableDays" text NOT NULL, "feeAmount" numeric(10,2) NOT NULL, "isPercentage" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_94d28d1f2f570c032c62f8d044f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "fixed_margins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "corridorId" uuid NOT NULL, "thresholdAmount" numeric(10,2) NOT NULL, "marginValue" numeric(10,4) NOT NULL, "isPercentage" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_540b1aa7803f892fafde1dd6b38" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "margin_slabs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "corridorId" uuid NOT NULL, "minAmount" numeric(10,2) NOT NULL, "maxAmount" numeric(10,2) NOT NULL, "marginValue" numeric(10,4) NOT NULL, "isPercentage" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0621f9034209862fad22973f0b8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "timing_margins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "corridorId" uuid NOT NULL, "startDate" date NOT NULL, "endDate" date, "startTime" character varying NOT NULL, "endTime" character varying NOT NULL, "applicableDays" text NOT NULL, "marginValue" numeric(10,4) NOT NULL, "isPercentage" boolean NOT NULL DEFAULT true, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a2219329ebb775983bac10538b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bank_margin_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "corridorId" uuid NOT NULL, "bankName" character varying NOT NULL, "currency" character varying(3) NOT NULL, "marginValue" numeric(10,4) NOT NULL, "isPercentage" boolean NOT NULL DEFAULT true, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2ab56f63299ff44125a9fc4aa98" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."corridors_mto_enum" AS ENUM('western_union', 'moneygram', 'mastercard')`);
        await queryRunner.query(`CREATE TYPE "public"."corridors_paymentchannel_enum" AS ENUM('bank', 'wallet', 'cash_pickup')`);
        await queryRunner.query(`CREATE TYPE "public"."corridors_status_enum" AS ENUM('active', 'inactive', 'suspended', 'pending')`);
        await queryRunner.query(`CREATE TYPE "public"."corridors_feetype_enum" AS ENUM('fixed_fees', 'fees_slab', 'timing', 'per_bank', 'as_per_mto')`);
        await queryRunner.query(`CREATE TYPE "public"."corridors_margintype_enum" AS ENUM('fixed_margin', 'margin_slab', 'timing_margin', 'per_bank_margin', 'as_per_mto')`);
        await queryRunner.query(`CREATE TABLE "corridors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "mto" "public"."corridors_mto_enum" NOT NULL, "country" character varying NOT NULL, "paymentChannel" "public"."corridors_paymentchannel_enum" NOT NULL, "currency" character varying NOT NULL, "status" "public"."corridors_status_enum" NOT NULL DEFAULT 'active', "feeType" "public"."corridors_feetype_enum" NOT NULL, "marginType" "public"."corridors_margintype_enum" NOT NULL, "organizationId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c67b65b44d9102f5cdf0df4adae" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "organizations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9b7ca6d30b94fef571cff876884" UNIQUE ("name"), CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."roles_permissions_enum" AS ENUM('create_user', 'read_user', 'update_user', 'delete_user', 'create_role', 'read_role', 'update_role', 'delete_role', 'create_corridor', 'read_corridor', 'update_corridor', 'delete_corridor', 'create_router', 'read_router', 'update_router', 'delete_router', 'create_bank_payer_mapping', 'read_bank_payer_mapping', 'update_bank_payer_mapping', 'delete_bank_payer_mapping', 'manage_organization', 'view_reports')`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "permissions" "public"."roles_permissions_enum" array NOT NULL DEFAULT '{}', "organizationId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0933e1dfb2993d672af1a98f08" ON "roles" ("organizationId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d27a5e69fb41256abed347a85e" ON "roles" ("organizationId", "name") `);
        await queryRunner.query(`CREATE TYPE "public"."users_defaultrole_enum" AS ENUM('organization_owner')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying, "phone" character varying, "password" character varying NOT NULL, "name" character varying NOT NULL, "defaultRole" "public"."users_defaultrole_enum", "roleId" uuid, "isActive" boolean NOT NULL DEFAULT true, "organizationId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bank_payer_mappings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bankName" character varying(255) NOT NULL, "mto" character varying(50) NOT NULL, "payerId" character varying(100) NOT NULL, "organizationId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9c7085f4deeb3cd9e9bc742fc0a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c1cb220d74ccb4b75d53100461" ON "bank_payer_mappings" ("bankName") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5c70c72331b8f0cd21b1e3850d" ON "bank_payer_mappings" ("bankName", "mto", "organizationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f508735fca6c5b86525e9b2d7d" ON "bank_payer_mappings" ("mto", "organizationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dbe99c73864181aff3cf79a32b" ON "bank_payer_mappings" ("bankName", "organizationId") `);
        await queryRunner.query(`CREATE TYPE "public"."routing_rules_ruletype_enum" AS ENUM('mto', 'amount_range', 'bank_specific')`);
        await queryRunner.query(`CREATE TYPE "public"."routing_rules_target_enum" AS ENUM('western_union', 'moneygram', 'mastercard')`);
        await queryRunner.query(`CREATE TABLE "routing_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "routerId" uuid NOT NULL, "ruleType" "public"."routing_rules_ruletype_enum" NOT NULL, "value" character varying(255) NOT NULL, "minAmount" numeric(15,2), "maxAmount" numeric(15,2), "target" "public"."routing_rules_target_enum" NOT NULL, "priority" integer NOT NULL DEFAULT '100', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b744c5cc71053ea4d3fc8a860c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_567960699a06ba7df50ce372d3" ON "routing_rules" ("routerId", "value") `);
        await queryRunner.query(`CREATE INDEX "IDX_3c60794dcfa8300a67f9c62b4d" ON "routing_rules" ("routerId", "ruleType") `);
        await queryRunner.query(`CREATE TYPE "public"."routers_strategy_enum" AS ENUM('mto', 'amount', 'bank')`);
        await queryRunner.query(`CREATE TYPE "public"."routers_defaultroute_enum" AS ENUM('western_union', 'moneygram', 'mastercard')`);
        await queryRunner.query(`CREATE TABLE "routers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country" character varying(2) NOT NULL, "bankName" character varying(255) NOT NULL, "currency" character varying(3) NOT NULL, "strategy" "public"."routers_strategy_enum" NOT NULL DEFAULT 'mto', "defaultRoute" "public"."routers_defaultroute_enum", "payoutType" character varying(50) NOT NULL, "organizationId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b6d283f1e40d4942dedbc0cb27a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a03431446edc82f9f6dd588857" ON "routers" ("bankName", "organizationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_783b9180ee1a59873e9c6d92ad" ON "routers" ("country", "organizationId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2ad42f81959b7decb7070db234" ON "routers" ("country", "bankName", "currency", "organizationId") `);
        await queryRunner.query(`ALTER TABLE "fees_slabs" ADD CONSTRAINT "FK_6e1238dd5fddaf8a530f61ecbb9" FOREIGN KEY ("corridorId") REFERENCES "corridors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fixed_fees" ADD CONSTRAINT "FK_c5c7a0ec2c8208718b5394a42d9" FOREIGN KEY ("corridorId") REFERENCES "corridors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bank_fee_configs" ADD CONSTRAINT "FK_618821602cc031ec2ea7f2d66f1" FOREIGN KEY ("corridorId") REFERENCES "corridors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "timing_fees" ADD CONSTRAINT "FK_f1c94a0c064676c7d6379dc109e" FOREIGN KEY ("corridorId") REFERENCES "corridors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fixed_margins" ADD CONSTRAINT "FK_1b975d027813e2de92e327fc9db" FOREIGN KEY ("corridorId") REFERENCES "corridors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "margin_slabs" ADD CONSTRAINT "FK_27f334631fbff65dd4a4fd5bd9a" FOREIGN KEY ("corridorId") REFERENCES "corridors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "timing_margins" ADD CONSTRAINT "FK_ab676afd15d0b38c90de058f715" FOREIGN KEY ("corridorId") REFERENCES "corridors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bank_margin_configs" ADD CONSTRAINT "FK_145e128e622fc4cd8f3c58a497e" FOREIGN KEY ("corridorId") REFERENCES "corridors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "corridors" ADD CONSTRAINT "FK_bfd793d5bbbd440cafd477cca97" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_368e146b785b574f42ae9e53d5e" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_f3d6aea8fcca58182b2e80ce979" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "routing_rules" ADD CONSTRAINT "FK_088c5fd1192b80f771cb4ad3eb6" FOREIGN KEY ("routerId") REFERENCES "routers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "routing_rules" DROP CONSTRAINT "FK_088c5fd1192b80f771cb4ad3eb6"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_f3d6aea8fcca58182b2e80ce979"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_368e146b785b574f42ae9e53d5e"`);
        await queryRunner.query(`ALTER TABLE "corridors" DROP CONSTRAINT "FK_bfd793d5bbbd440cafd477cca97"`);
        await queryRunner.query(`ALTER TABLE "bank_margin_configs" DROP CONSTRAINT "FK_145e128e622fc4cd8f3c58a497e"`);
        await queryRunner.query(`ALTER TABLE "timing_margins" DROP CONSTRAINT "FK_ab676afd15d0b38c90de058f715"`);
        await queryRunner.query(`ALTER TABLE "margin_slabs" DROP CONSTRAINT "FK_27f334631fbff65dd4a4fd5bd9a"`);
        await queryRunner.query(`ALTER TABLE "fixed_margins" DROP CONSTRAINT "FK_1b975d027813e2de92e327fc9db"`);
        await queryRunner.query(`ALTER TABLE "timing_fees" DROP CONSTRAINT "FK_f1c94a0c064676c7d6379dc109e"`);
        await queryRunner.query(`ALTER TABLE "bank_fee_configs" DROP CONSTRAINT "FK_618821602cc031ec2ea7f2d66f1"`);
        await queryRunner.query(`ALTER TABLE "fixed_fees" DROP CONSTRAINT "FK_c5c7a0ec2c8208718b5394a42d9"`);
        await queryRunner.query(`ALTER TABLE "fees_slabs" DROP CONSTRAINT "FK_6e1238dd5fddaf8a530f61ecbb9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2ad42f81959b7decb7070db234"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_783b9180ee1a59873e9c6d92ad"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a03431446edc82f9f6dd588857"`);
        await queryRunner.query(`DROP TABLE "routers"`);
        await queryRunner.query(`DROP TYPE "public"."routers_defaultroute_enum"`);
        await queryRunner.query(`DROP TYPE "public"."routers_strategy_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3c60794dcfa8300a67f9c62b4d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_567960699a06ba7df50ce372d3"`);
        await queryRunner.query(`DROP TABLE "routing_rules"`);
        await queryRunner.query(`DROP TYPE "public"."routing_rules_target_enum"`);
        await queryRunner.query(`DROP TYPE "public"."routing_rules_ruletype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dbe99c73864181aff3cf79a32b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f508735fca6c5b86525e9b2d7d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5c70c72331b8f0cd21b1e3850d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c1cb220d74ccb4b75d53100461"`);
        await queryRunner.query(`DROP TABLE "bank_payer_mappings"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_defaultrole_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d27a5e69fb41256abed347a85e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0933e1dfb2993d672af1a98f08"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TYPE "public"."roles_permissions_enum"`);
        await queryRunner.query(`DROP TABLE "organizations"`);
        await queryRunner.query(`DROP TABLE "corridors"`);
        await queryRunner.query(`DROP TYPE "public"."corridors_margintype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."corridors_feetype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."corridors_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."corridors_paymentchannel_enum"`);
        await queryRunner.query(`DROP TYPE "public"."corridors_mto_enum"`);
        await queryRunner.query(`DROP TABLE "bank_margin_configs"`);
        await queryRunner.query(`DROP TABLE "timing_margins"`);
        await queryRunner.query(`DROP TABLE "margin_slabs"`);
        await queryRunner.query(`DROP TABLE "fixed_margins"`);
        await queryRunner.query(`DROP TABLE "timing_fees"`);
        await queryRunner.query(`DROP TABLE "bank_fee_configs"`);
        await queryRunner.query(`DROP TABLE "fixed_fees"`);
        await queryRunner.query(`DROP TABLE "fees_slabs"`);
    }

}
