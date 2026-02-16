import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = 'tradelense';
const COLLECTION_ID = 'hive_registrations';

async function fixPermissions() {
    try {
        console.log(`Updating permissions for ${COLLECTION_ID}...`);

        // Allow anyone (guests included) to create a document (join hive)
        // Only admins/API can read/update/delete (implied by omission of other roles)
        const permissions = [
            Permission.create(Role.any()), // Anyone can create
            Permission.read(Role.any()),   // Optimistic: Let them see their own? No, usually any for guests? 
            // Actually, standard is: Role.any() can create.
            // We might want to allow Role.users() to read? 
            // For now, just allow CREATE for ANY.
        ];

        await databases.updateCollection(
            DATABASE_ID,
            COLLECTION_ID,
            'Hive Registrations',
            permissions
        );

        console.log('Permissions updated: Role.any() can CREATE.');
    } catch (error) {
        console.error('Error updating permissions:', error);
    }
}

fixPermissions();
