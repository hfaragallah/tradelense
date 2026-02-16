import { Client, Databases, ID } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
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

async function initHive() {
    try {
        console.log('--- Initializing Hive Registrations ---');
        console.log('Database ID:', DATABASE_ID);
        console.log('Collection ID:', COLLECTION_ID);

        // Check if database exists
        try {
            await databases.get(DATABASE_ID);
            console.log('Database exists.');
        } catch (e) {
            console.error('Database not found! Please create "tradelense" database manually or adjust script.');
            // Or create it: await databases.create(DATABASE_ID, 'TradeLense DB');
            return;
        }

        // Check if collection exists
        try {
            await databases.getCollection(DATABASE_ID, COLLECTION_ID);
            console.log('Collection already exists.');
        } catch (e) {
            console.log('Collection not found. Creating...');
            await databases.createCollection(DATABASE_ID, COLLECTION_ID, 'Hive Registrations');
            console.log('Collection created.');

            // Create Attributes
            console.log('Creating attributes...');
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'email', 255, true);
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'preference', 50, true);
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'source', 50, false, 'web');
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'timestamp', 50, false);

            console.log('Waiting for attributes to propagate...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            console.log('Success! Hive Registrations collection is ready.');
        }
    } catch (error) {
        console.error('Error initializing Hive DB:', error);
    }
}

initHive();
