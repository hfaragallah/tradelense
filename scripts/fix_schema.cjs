/**
 * fix_schema.cjs — Fix Appwrite collection schema mismatches
 *
 * Trades: imageUrl is required but should be optional
 * Posts: timestamp (string) is required but frontend sends createdAt instead
 */
require('dotenv').config();
const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '698d7ab00021a58fe096')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DB = 'tradelense';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function deleteAndRecreate(collection, key, type, size, required, defaultVal, isArray) {
    // Delete existing attribute
    try {
        await databases.deleteAttribute(DB, collection, key);
        console.log(`  🗑️  Deleted ${key}`);
        await sleep(3000); // Wait for deletion to process
    } catch (e) {
        if (e.code === 404) {
            console.log(`  ℹ️  ${key} does not exist, creating fresh`);
        } else {
            console.error(`  ⚠️  Delete ${key} error:`, e.message);
        }
    }

    // Recreate with correct settings
    try {
        if (type === 'string') {
            await databases.createStringAttribute(DB, collection, key, size, required, defaultVal || undefined, isArray || false);
        } else if (type === 'datetime') {
            await databases.createDatetimeAttribute(DB, collection, key, required, defaultVal || undefined);
        }
        console.log(`  ✅ Recreated ${key} (required=${required})`);
        await sleep(2000);
    } catch (e) {
        if (e.code === 409) {
            console.log(`  ℹ️  ${key} already exists with correct settings`);
        } else {
            console.error(`  ❌ Create ${key} error:`, e.message);
        }
    }
}

async function fixSchema() {
    console.log('=== Fixing Appwrite Schema ===\n');

    // 1. Fix TRADES: imageUrl should be optional
    console.log('📦 Fixing TRADES collection...');
    await deleteAndRecreate('trades', 'imageUrl', 'string', 2048, false, null, false);

    // 2. Fix POSTS: timestamp should be optional (or we ensure frontend always sends it)
    console.log('\n📦 Fixing POSTS collection...');
    await deleteAndRecreate('posts', 'timestamp', 'string', 255, false, null, false);

    // Wait for schema to stabilize
    console.log('\n⏳ Waiting for schema to stabilize...');
    await sleep(3000);

    // 3. Verify by testing creation
    const { ID, Query } = require('node-appwrite');

    console.log('\n--- Verification: Test Trade Creation ---');
    try {
        const doc = await databases.createDocument(DB, 'trades', ID.unique(), {
            authorId: 'test_verify', authorName: 'Schema Test', authorReputation: 0,
            asset: 'BTC/USDT', market: 'Crypto', type: 'LONG',
            entryMin: 95000, entryMax: 96000, stopLoss: 94000,
            takeProfit: [98000], timeHorizon: 'Swing (Days)',
            rationale: 'Schema verification test',
            rationaleTags: ['Technical'], confidenceScore: 50,
            timestamp: new Date().toISOString()
            // NO imageUrl — this should now work
        });
        console.log(`✅ Trade creation WITHOUT imageUrl succeeded! ID: ${doc.$id}`);
        await databases.deleteDocument(DB, 'trades', doc.$id);
        console.log('✅ Cleanup done');
    } catch (e) {
        console.log(`❌ Trade creation still fails: ${e.message}`);
    }

    console.log('\n--- Verification: Test Post Creation ---');
    try {
        const doc = await databases.createDocument(DB, 'posts', ID.unique(), {
            authorId: 'test_verify', authorName: 'Schema Test',
            authorHandle: 'test', title: 'Test Post',
            content: 'Schema verification test', tag: 'General',
            upvotes: 0, commentCount: 0, isPinned: false,
            comments: JSON.stringify([]),
            createdAt: new Date().toISOString()
            // NO timestamp — this should now work since it's optional
        });
        console.log(`✅ Post creation WITHOUT timestamp succeeded! ID: ${doc.$id}`);
        await databases.deleteDocument(DB, 'posts', doc.$id);
        console.log('✅ Cleanup done');
    } catch (e) {
        console.log(`❌ Post creation still fails: ${e.message}`);
    }

    console.log('\n🎉 Schema fix complete!');
}

fixSchema().catch(e => console.error('Fatal:', e));
