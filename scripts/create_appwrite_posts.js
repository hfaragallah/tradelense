import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const endpoint = process.env.VITE_APPWRITE_ENDPOINT;
const projectId = process.env.VITE_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!endpoint || !projectId || !apiKey) {
    console.error('Missing Appwrite environment variables. Please check your .env file.');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

const databases = new Databases(client);
const DATABASE_ID = 'tradelense';
const COLLECTION_ID = 'posts';
const COLLECTION_NAME = 'Posts';

async function createPostsCollection() {
    try {
        console.log(`Checking if collection ${COLLECTION_ID} exists...`);
        try {
            await databases.getCollection(DATABASE_ID, COLLECTION_ID);
            console.log(`Collection ${COLLECTION_ID} already exists.`);
        } catch (error) {
            if (error.code === 404) {
                console.log(`Creating collection ${COLLECTION_ID}...`);
                await databases.createCollection(
                    DATABASE_ID,
                    COLLECTION_ID,
                    COLLECTION_NAME,
                    [
                        Permission.read(Role.any()),
                        Permission.create(Role.users()),
                        Permission.update(Role.users()),
                        Permission.delete(Role.users()),
                    ]
                );
                console.log('Collection created successfully.');
            } else {
                throw error;
            }
        }

        console.log('Creating attributes...');
        // String attributes
        const stringAttributes = [
            { key: 'authorId', size: 255, required: true },
            { key: 'authorName', size: 255, required: true },
            { key: 'authorHandle', size: 255, required: true },
            { key: 'authorAvatar', size: 1024, required: false },
            { key: 'title', size: 255, required: true },
            { key: 'content', size: 10000, required: true },
            { key: 'tag', size: 50, required: true },
            { key: 'timestamp', size: 255, required: true },
            { key: 'comments', size: 65535, required: false }, // Store strigified JSON array of comments
        ];

        for (const attr of stringAttributes) {
            try {
                await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.size, attr.required);
                console.log(`Created string attribute: ${attr.key}`);
            } catch (e) {
                if (e.code === 409) console.log(`Attribute ${attr.key} already exists.`);
                else console.error(`Failed to create ${attr.key}:`, e.message);
            }
        }

        // Integer attributes
        const intAttributes = [
            { key: 'upvotes', required: false, default: 0 },
            { key: 'commentCount', required: false, default: 0 }
        ];

        for (const attr of intAttributes) {
            try {
                await databases.createIntegerAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.required, 0, 1000000, attr.default);
                console.log(`Created integer attribute: ${attr.key}`);
            } catch (e) {
                if (e.code === 409) console.log(`Attribute ${attr.key} already exists.`);
                else console.error(`Failed to create ${attr.key}:`, e.message);
            }
        }

        // Boolean attributes
        try {
            await databases.createBooleanAttribute(DATABASE_ID, COLLECTION_ID, 'isPinned', false, false);
            console.log(`Created boolean attribute: isPinned`);
        } catch (e) {
            if (e.code === 409) console.log(`Attribute isPinned already exists.`);
            else console.error(`Failed to create isPinned:`, e.message);
        }

        console.log('\n✅ Posts collection and attributes setup complete!');
        console.log('Note: It may take a few moments for Appwrite to fully process attribute creation.');

    } catch (error) {
        console.error('Error setting up collection:', error);
    }
}

createPostsCollection();
