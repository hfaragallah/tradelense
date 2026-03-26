require('dotenv').config();
const { Client, Databases, Permission, Role, ID } = require('node-appwrite');

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '698d7ab00021a58fe096')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const dbId = 'tradelense';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function createAttribute(db, collection, type, key, ...args) {
    try {
        if (type === 'string') await databases.createStringAttribute(db, collection, key, ...args);
        else if (type === 'integer') await databases.createIntegerAttribute(db, collection, key, ...args);
        else if (type === 'float') await databases.createFloatAttribute(db, collection, key, ...args);
        else if (type === 'boolean') await databases.createBooleanAttribute(db, collection, key, ...args);
        else if (type === 'datetime') await databases.createDatetimeAttribute(db, collection, key, ...args);
        
        console.log(`Attribute ${key} created natively.`);
        await sleep(1500); // Allow attribute to process
    } catch (e) {
        if (e.code === 409) console.log(`Attribute ${key} already exists.`);
        else console.error(`Error creating attribute ${key}:`, e.message);
    }
}

async function setup() {
    try {
        console.log("Checking Database...");
        try {
            await databases.get(dbId);
            console.log("Database 'tradelense' exists.");
        } catch (e) {
            if (e.code === 404) {
                await databases.create(dbId, 'Tradelense App');
                console.log("Database created.");
            } else throw e;
        }

        const defaultPerms = [
            Permission.read(Role.any()),
            Permission.create(Role.any()),
            Permission.update(Role.any()),
            Permission.delete(Role.any())
        ];

        // PROFILES
        console.log("\nSetting up PROFILES collection...");
        try {
            await databases.createCollection(dbId, 'profiles', 'Profiles', defaultPerms);
        } catch (e) {
            if (e.code !== 409) console.error(e.message);
        }
        await createAttribute(dbId, 'profiles', 'string', 'userId', 36, true);
        await createAttribute(dbId, 'profiles', 'string', 'name', 255, false);
        await createAttribute(dbId, 'profiles', 'string', 'handle', 255, false);
        await createAttribute(dbId, 'profiles', 'string', 'email', 255, false);
        await createAttribute(dbId, 'profiles', 'string', 'avatar', 2048, false);
        await createAttribute(dbId, 'profiles', 'boolean', 'isAdmin', false, false);
        await createAttribute(dbId, 'profiles', 'integer', 'reputationScore', false, 0, 1000000, 0);
        await createAttribute(dbId, 'profiles', 'integer', 'points', false, 0, 1000000, 0);
        await createAttribute(dbId, 'profiles', 'float', 'winRate', false, 0, 100, 0);
        await createAttribute(dbId, 'profiles', 'integer', 'totalTrades', false, 0, 1000000, 0);
        await createAttribute(dbId, 'profiles', 'integer', 'followersCount', false, 0, 1000000, 0);
        await createAttribute(dbId, 'profiles', 'integer', 'followingCount', false, 0, 1000000, 0);

        // FOLLOWS
        console.log("\nSetting up FOLLOWS collection...");
        try {
            await databases.createCollection(dbId, 'follows', 'Follows', defaultPerms);
        } catch (e) {
            if (e.code !== 409) console.error(e.message);
        }
        await createAttribute(dbId, 'follows', 'string', 'followerId', 36, true);
        await createAttribute(dbId, 'follows', 'string', 'followingId', 36, true);
        await createAttribute(dbId, 'follows', 'datetime', 'timestamp', false);

        // POSTS
        console.log("\nSetting up POSTS collection...");
        try {
            await databases.createCollection(dbId, 'posts', 'Posts', defaultPerms);
        } catch (e) {
            if (e.code !== 409) console.error(e.message);
        }
        await createAttribute(dbId, 'posts', 'string', 'authorId', 36, true);
        await createAttribute(dbId, 'posts', 'string', 'authorName', 255, false);
        await createAttribute(dbId, 'posts', 'string', 'title', 255, true);
        await createAttribute(dbId, 'posts', 'string', 'content', 1500, true);
        await createAttribute(dbId, 'posts', 'integer', 'upvotes', false, 0, 1000000, 0);
        await createAttribute(dbId, 'posts', 'datetime', 'createdAt', false);

        // TRADES
        console.log("\nSetting up TRADES collection...");
        try {
            await databases.createCollection(dbId, 'trades', 'Trades', defaultPerms);
        } catch (e) {
            if (e.code !== 409) console.error(e.message);
        }
        await createAttribute(dbId, 'trades', 'string', 'authorId', 36, true);
        await createAttribute(dbId, 'trades', 'string', 'authorName', 255, false);
        await createAttribute(dbId, 'trades', 'integer', 'authorReputation', false, 0, 1000000, 0);
        await createAttribute(dbId, 'trades', 'string', 'asset', 50, true);
        await createAttribute(dbId, 'trades', 'string', 'market', 100, true);
        await createAttribute(dbId, 'trades', 'string', 'type', 50, true);
        await createAttribute(dbId, 'trades', 'float', 'entryMin', true, -1000000, 1000000000, null);
        await createAttribute(dbId, 'trades', 'float', 'entryMax', false, -1000000, 1000000000, null);
        await createAttribute(dbId, 'trades', 'float', 'stopLoss', true, -1000000, 1000000000, null);
        await createAttribute(dbId, 'trades', 'float', 'takeProfit', true, -1000000, 1000000000, null, true); // array
        await createAttribute(dbId, 'trades', 'string', 'timeHorizon', 100, true);
        await createAttribute(dbId, 'trades', 'string', 'rationale', 3000, true);
        await createAttribute(dbId, 'trades', 'string', 'rationaleTags', 255, false, null, true); // array
        await createAttribute(dbId, 'trades', 'float', 'confidenceScore', false, 0, 100, 0);
        await createAttribute(dbId, 'trades', 'string', 'imageUrl', 2048, false);
        await createAttribute(dbId, 'trades', 'datetime', 'timestamp', false);

        // CONTACT MESSAGES
        console.log("\nSetting up CONTACT_MESSAGES collection...");
        try {
            await databases.createCollection(dbId, 'contact_messages', 'Contact Messages', defaultPerms);
        } catch (e) {
            if (e.code !== 409) console.error(e.message);
        }
        await createAttribute(dbId, 'contact_messages', 'string', 'name', 255, true);
        await createAttribute(dbId, 'contact_messages', 'string', 'email', 255, true);
        await createAttribute(dbId, 'contact_messages', 'string', 'subject', 255, true);
        await createAttribute(dbId, 'contact_messages', 'string', 'message', 5000, true);
        await createAttribute(dbId, 'contact_messages', 'string', 'status', 50, false, 'pending');
        await createAttribute(dbId, 'contact_messages', 'datetime', 'timestamp', false);

        console.log("\nAppwrite Setup Complete!");

    } catch (e) {
        console.error("Critical Setup Error:", e);
    }
}

setup();
