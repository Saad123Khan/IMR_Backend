import { AppDataSource } from './src/database';
import { Role } from './src/auth/entities/role.entity';

async function checkPermissions() {
    try {
        await AppDataSource.initialize();
        const role = await AppDataSource.getRepository(Role).findOne({
            where: { name: 'Organization Owner' }
        });

        if (role) {
            console.log('Role found:', role.name);
            console.log('Permissions:', JSON.stringify(role.permissions, null, 2));
        } else {
            console.log('Role "Organization Owner" not found.');
        }

        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error checking permissions:', error);
        process.exit(1);
    }
}

checkPermissions();
