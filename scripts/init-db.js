import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env from root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
    console.error('❌ Missing Environment Variables. Please check .env');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);
const DATABASE_ID = 'tradelense';

const COLLECTIONS = {
    PROFILES: {
        id: 'profiles',
        name: 'User Profiles',
        attributes: [
            { key: 'userId', type: 'string', size: 36, required: true },
            { key: 'name', type: 'string', size: 100, required: false },
            { key: 'handle', type: 'string', size: 50, required: true },
            { key: 'email', type: 'string', size: 255, required: false },
            { key: 'avatar', type: 'string', size: 1024, required: false },
            { key: 'reputationScore', type: 'integer', required: false, default: 0 },
            { key: 'points', type: 'integer', required: false, default: 0 },
            { key: 'followersCount', type: 'integer', required: false, default: 0 },
            { key: 'followingCount', type: 'integer', required: false, default: 0 },
            { key: 'isAdmin', type: 'boolean', required: false, default: false },
            { key: 'badges', type: 'string', size: 5000, required: false, array: true }, // Array of badge IDs/Strings
        ],
        indexes: [
            { key: 'idx_reputation', type: 'key', attributes: ['reputationScore'], order: 'DESC' },
            { key: 'idx_points', type: 'key', attributes: ['points'], order: 'DESC' },
            { key: 'idx_userid', type: 'unique', attributes: ['userId'] },
            { key: 'idx_handle', type: 'unique', attributes: ['handle'] }
        ]
    },
    FOLLOWS: {
        id: 'follows',
        name: 'Follows',
        attributes: [
            { key: 'followerId', type: 'string', size: 36, required: true },
            { key: 'followingId', type: 'string', size: 36, required: true }
        ],
        indexes: [
            { key: 'idx_unique_follow', type: 'unique', attributes: ['followerId', 'followingId'] },
            { key: 'idx_follower', type: 'key', attributes: ['followerId'] },
            { key: 'idx_following', type: 'key', attributes: ['followingId'] }
        ]
    },
    POINTS_HISTORY: {
        id: 'points_history',
        name: 'Points History',
        attributes: [
            { key: 'userId', type: 'string', size: 36, required: true },
            { key: 'action', type: 'string', size: 50, required: true },
            { key: 'points', type: 'integer', required: true },
            { key: 'timestamp', type: 'datetime', required: true }
        ],
        indexes: [
            { key: 'idx_user_points', type: 'key', attributes: ['userId'] }
        ]
    }
};

async function initDB() {
    console.log(`🚀 Initializing Database: ${DATABASE_ID}...`);

    try {
        await databases.get(DATABASE_ID);
        console.log(`✅ Database '${DATABASE_ID}' already exists.`);
    } catch (error) {
        console.log(`⚠️ Database '${DATABASE_ID}' not found. Creating...`);
        await databases.create(DATABASE_ID, DATABASE_ID);
        console.log(`✅ Created Database '${DATABASE_ID}'.`);
    }

    for (const [key, config] of Object.entries(COLLECTIONS)) {
        console.log(`\n📦 Processing Collection: ${config.name} (${config.id})...`);

        // 1. Create Collection
        try {
            await databases.getCollection(DATABASE_ID, config.id);
            console.log(`   ✅ Collection exists.`);
        } catch (error) {
            console.log(`   ⚠️ Collection not found. Creating...`);
            await databases.createCollection(
                DATABASE_ID,
                config.id,
                config.name,
                [
                    Permission.read(Role.any()), // Public Read
                    Permission.create(Role.users()), // Users can create
                    Permission.update(Role.users()), // Users can update
                    Permission.delete(Role.users()) // Users can delete
                ]
            );
            console.log(`   ✅ Created Collection.`);
        }

        // 2. Create Attributes
        console.log(`   🔧 Checking Attributes...`);
        const existingAttrs = await databases.listAttributes(DATABASE_ID, config.id);
        const existingAttrKeys = existingAttrs.attributes.map(a => a.key);

        for (const attr of config.attributes) {
            if (existingAttrKeys.includes(attr.key)) {
                console.log(`      🔹 Attribute '${attr.key}' exists.`);
                continue;
            }

            console.log(`      ➕ Creating attribute '${attr.key}'...`);
            try {
                if (attr.type === 'string') {
                    if (attr.array) {
                        await databases.createStringAttribute(DATABASE_ID, config.id, attr.key, attr.size, false, undefined, true);
                    } else {
                        await databases.createStringAttribute(DATABASE_ID, config.id, attr.key, attr.size, attr.required, attr.default);
                    }
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(DATABASE_ID, config.id, attr.key, attr.required, 0, 999999999, attr.default);
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(DATABASE_ID, config.id, attr.key, attr.required, attr.default);
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(DATABASE_ID, config.id, attr.key, attr.required, attr.default);
                }
                // Wait a bit for attribute to be processed
                await new Promise(r => setTimeout(r, 500));
            } catch (e) {
                console.error(`      ❌ Failed to create attribute '${attr.key}':`, e.message);
            }
        }

        // 3. Create Indexes
        console.log(`   🔍 Checking Indexes...`);
        const existingIndexes = await databases.listIndexes(DATABASE_ID, config.id);
        const existingIndexKeys = existingIndexes.indexes.map(i => i.key);

        // Wait for attributes to be available (Appwrite requires this)
        console.log(`      ⏳ Waiting for attributes to index...`);
        await new Promise(r => setTimeout(r, 2000));

        for (const idx of config.indexes) {
            if (existingIndexKeys.includes(idx.key)) {
                console.log(`      🔹 Index '${idx.key}' exists.`);
                continue;
            }

            console.log(`      ➕ Creating index '${idx.key}'...`);
            try {
                await databases.createIndex(DATABASE_ID, config.id, idx.key, idx.type, idx.attributes, idx.order ? [idx.order] : undefined);
            } catch (e) {
                console.error(`      ❌ Failed to create index '${idx.key}':`, e.message);
            }
        }
    }

    console.log('\n🎉 Database Initialization Complete!');
}

initDB();
