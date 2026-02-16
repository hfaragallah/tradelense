import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const endpoint = process.env.VITE_APPWRITE_ENDPOINT;
const projectId = process.env.VITE_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!endpoint || !projectId || !apiKey) {
    console.error('Missing configuration. Please check your .env file for VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, and APPWRITE_API_KEY.');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

const databases = new Databases(client);

const DATABASE_ID = 'tradelense';

const COLLECTIONS = {
    TRADES: {
        id: 'trades',
        name: 'Trades',
        permissions: [
            Permission.read(Role.any()), // Public read
            Permission.create(Role.users()), // Authenticated create
            Permission.update(Role.users()), // Update (needs row-level security ideally, but starting simple)
            Permission.delete(Role.users()),
        ],
        attributes: [
            { key: 'authorId', type: 'string', size: 255, required: true },
            { key: 'authorName', type: 'string', size: 255, required: true },
            { key: 'asset', type: 'string', size: 50, required: true },
            { key: 'market', type: 'string', size: 50, required: true },
            { key: 'type', type: 'string', size: 20, required: true }, // LONG/SHORT
            { key: 'entryMin', type: 'double', required: true },
            { key: 'entryMax', type: 'double', required: true },
            { key: 'stopLoss', type: 'double', required: true },
            { key: 'takeProfit', type: 'double', required: true, array: true },
            { key: 'timeHorizon', type: 'string', size: 50, required: true },
            { key: 'rationale', type: 'string', size: 5000, required: true },
            { key: 'rationaleTags', type: 'string', size: 50, required: false, array: true },
            { key: 'confidenceScore', type: 'double', required: true },
            { key: 'status', type: 'string', size: 20, required: false, default: 'OPEN' }, // OPEN, CLOSED, CANCELLED
            { key: 'imageUrl', type: 'url', required: false },
            // Crowd stats - flattened
            { key: 'crowdAgree', type: 'integer', required: false, default: 0 },
            { key: 'crowdDisagree', type: 'integer', required: false, default: 0 },
            { key: 'crowdWait', type: 'integer', required: false, default: 0 },
            { key: 'crowdTotal', type: 'integer', required: false, default: 0 },
        ]
    },
    PROFILES: {
        id: 'profiles',
        name: 'Profiles',
        permissions: [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
        ],
        attributes: [
            { key: 'userId', type: 'string', size: 255, required: true },
            { key: 'handle', type: 'string', size: 50, required: true },
            { key: 'bio', type: 'string', size: 1000, required: false },
            { key: 'reputationScore', type: 'integer', required: false, default: 0 },
            { key: 'isAdmin', type: 'boolean', required: false, default: false },
        ]
    },
    FEEDBACK: {
        id: 'feedback',
        name: 'Feedback',
        permissions: [
            Permission.read(Role.users()), // Only authenticated users can read
            Permission.create(Role.users()), // Authenticated users can create
            Permission.update(Role.users()), // Users can update their own feedback
            Permission.delete(Role.users()),
        ],
        attributes: [
            { key: 'userId', type: 'string', size: 255, required: true },
            { key: 'userName', type: 'string', size: 255, required: true },
            { key: 'type', type: 'string', size: 50, required: true }, // BUG, FEATURE_REQUEST, GENERAL, COMPLAINT
            { key: 'category', type: 'string', size: 50, required: false }, // Trade Analysis, UI/UX, Performance, etc.
            { key: 'message', type: 'string', size: 5000, required: true },
            { key: 'rating', type: 'integer', required: false }, // 1-5 star rating (optional)
            { key: 'status', type: 'string', size: 20, required: false, default: 'PENDING' }, // PENDING, REVIEWED, RESOLVED, CLOSED
            { key: 'priority', type: 'string', size: 20, required: false, default: 'MEDIUM' }, // LOW, MEDIUM, HIGH, CRITICAL
            { key: 'adminNotes', type: 'string', size: 2000, required: false }, // Admin response/notes
            { key: 'isResolved', type: 'boolean', required: false, default: false },
            { key: 'screenshotUrl', type: 'url', required: false }, // Optional screenshot
        ]
    }
};

async function setup() {
    console.log('Starting Appwrite Setup...');

    // 1. Create Database
    try {
        await databases.get(DATABASE_ID);
        console.log(`Database "${DATABASE_ID}" already exists.`);
    } catch (error) {
        if (error.code === 404) {
            console.log(`Creating database "${DATABASE_ID}"...`);
            await databases.create(DATABASE_ID, DATABASE_ID);
        } else {
            throw error;
        }
    }

    // 2. Create Collections and Attributes
    for (const [key, config] of Object.entries(COLLECTIONS)) {
        try {
            await databases.getCollection(DATABASE_ID, config.id);
            console.log(`Collection "${config.name}" already exists.`);
        } catch (error) {
            if (error.code === 404) {
                console.log(`Creating collection "${config.name}"...`);
                await databases.createCollection(DATABASE_ID, config.id, config.name, config.permissions);
            } else {
                throw error;
            }
        }

        // Attributes
        console.log(`Checking attributes for "${config.name}"...`);
        // Wait a bit for collection creation to propagate if just created
        await new Promise(resolve => setTimeout(resolve, 2000));

        const existingAttributes = await databases.listAttributes(DATABASE_ID, config.id);
        const existingKeys = existingAttributes.attributes.map(a => a.key);

        for (const attr of config.attributes) {
            if (existingKeys.includes(attr.key)) {
                continue;
            }

            console.log(`Creating attribute "${attr.key}"...`);
            try {
                if (attr.type === 'string') {
                    if (attr.array) {
                        await databases.createStringAttribute(DATABASE_ID, config.id, attr.key, attr.size, true, undefined, attr.array);
                    } else {
                        // fix: if default is provided, required must be false
                        const isRequired = attr.default !== undefined ? false : attr.required;
                        await databases.createStringAttribute(DATABASE_ID, config.id, attr.key, attr.size, isRequired, attr.default);
                    }
                } else if (attr.type === 'integer') {
                    const isRequired = attr.default !== undefined ? false : attr.required;
                    await databases.createIntegerAttribute(DATABASE_ID, config.id, attr.key, isRequired, null, null, attr.default);
                } else if (attr.type === 'double') {
                    if (attr.array) {
                        await databases.createFloatAttribute(DATABASE_ID, config.id, attr.key, true, null, null, undefined, true);
                    } else {
                        const isRequired = attr.default !== undefined ? false : attr.required;
                        await databases.createFloatAttribute(DATABASE_ID, config.id, attr.key, isRequired, null, null, attr.default);
                    }
                } else if (attr.type === 'boolean') {
                    const isRequired = attr.default !== undefined ? false : attr.required;
                    await databases.createBooleanAttribute(DATABASE_ID, config.id, attr.key, isRequired, attr.default);
                } else if (attr.type === 'url') {
                    // Url attributes don't support default in the same way depending on sdk version but we'll try standard pattern
                    // Actually check if url supports default in this version, if not remove default.
                    // Assuming it roughly follows string pattern
                    const isRequired = attr.default !== undefined ? false : attr.required;
                    await databases.createUrlAttribute(DATABASE_ID, config.id, attr.key, isRequired, attr.default);
                }

                // Sleep to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                console.error(`Failed to create attribute ${attr.key}:`, err.message);
            }
        }
    }

    console.log('Setup complete!');
}

setup().catch(console.error);
