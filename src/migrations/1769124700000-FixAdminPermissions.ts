import { MigrationInterface, QueryRunner } from "typeorm";

export class FixAdminPermissions1769124700000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Explicitly listing all permissions from Permission enum
        const allPermissions = [
            'create_user', 'read_user', 'update_user', 'delete_user',
            'create_role', 'read_role', 'update_role', 'delete_role',
            'create_corridor', 'read_corridor', 'update_corridor', 'delete_corridor',
            'create_router', 'read_router', 'update_router', 'delete_router',
            'create_bank_payer_mapping', 'read_bank_payer_mapping', 'update_bank_payer_mapping', 'delete_bank_payer_mapping',
            'manage_organization', 'view_reports', 'read_webhook_logs'
        ];

        const permissionsStr = allPermissions.map(p => `'${p}'`).join(', ');

        // Update the 'Organization Owner' role to have all permissions
        // Using PostgreSQL array syntax and casting to the enum type
        await queryRunner.query(`
            UPDATE "roles" 
            SET "permissions" = ARRAY[${permissionsStr}]::"public"."roles_permissions_enum"[]
            WHERE "name" = 'Organization Owner'
        `);
        
        console.log('Successfully updated "Organization Owner" role with all permissions.');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No revert logic needed for this fix
    }
}
