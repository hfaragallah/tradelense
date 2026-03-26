/**
 * Deep Appwrite Authentication Diagnostic
 * Tests every auth pathway to identify exactly what is broken.
 */
import { Client, Account, Databases, ID } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID || '698d7ab00021a58fe096';

console.log('=== APPWRITE DEEP DIAGNOSTIC ===');
console.log(`Endpoint: ${ENDPOINT}`);
console.log(`Project ID: ${PROJECT_ID}`);
console.log('');

const client = new Client();
client.setEndpoint(ENDPOINT).setProject(PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);

async function testHealth() {
    console.log('--- Test 1: Health / Ping ---');
    try {
        // Use fetch directly to check the health endpoint
        const res = await fetch(`${ENDPOINT}/health`);
        const data = await res.json();
        console.log(`✅ Health check passed. Status: ${res.status}`);
        console.log(`   Response:`, JSON.stringify(data));
    } catch (e) {
        console.log(`❌ Health check FAILED: ${e.message}`);
    }
    console.log('');
}

async function testEmailRegister() {
    console.log('--- Test 2: Email Registration ---');
    const testEmail = `test_diag_${Date.now()}@example.com`;
    const testPassword = 'TestPass123!';
    const testName = 'DiagUser';
    try {
        const user = await account.create(ID.unique(), testEmail, testPassword, testName);
        console.log(`✅ Registration succeeded! User ID: ${user.$id}`);
        return { email: testEmail, password: testPassword, userId: user.$id };
    } catch (e) {
        console.log(`❌ Registration FAILED. Code: ${e.code}, Type: ${e.type}`);
        console.log(`   Message: ${e.message}`);
        return null;
    }
}

async function testEmailLogin(email, password) {
    console.log('');
    console.log('--- Test 3: Email/Password Login ---');
    try {
        const session = await account.createEmailPasswordSession(email, password);
        console.log(`✅ Login succeeded! Session ID: ${session.$id}`);
        return session;
    } catch (e) {
        console.log(`❌ Login FAILED. Code: ${e.code}, Type: ${e.type}`);
        console.log(`   Message: ${e.message}`);
        return null;
    }
}

async function testGetUser() {
    console.log('');
    console.log('--- Test 4: Get Current User (after login) ---');
    try {
        const user = await account.get();
        console.log(`✅ Get user succeeded! Name: ${user.name}, Email: ${user.email}`);
        return user;
    } catch (e) {
        console.log(`❌ Get user FAILED. Code: ${e.code}, Type: ${e.type}`);
        console.log(`   Message: ${e.message}`);
        return null;
    }
}

async function testGoogleOAuthURL() {
    console.log('');
    console.log('--- Test 5: Google OAuth2 URL Generation ---');
    try {
        // In the browser SDK, createOAuth2Session redirects. In node-appwrite, 
        // we can check if the OAuth provider is configured by listing providers.
        // Let's just try to hit the OAuth2 endpoint directly.
        const successUrl = 'http://localhost:3000';
        const failureUrl = 'http://localhost:3000';
        const url = `${ENDPOINT}/account/sessions/oauth2/google?project=${PROJECT_ID}&success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}`;
        console.log(`   OAuth URL: ${url}`);
        
        const res = await fetch(url, { redirect: 'manual' });
        console.log(`   Response status: ${res.status}`);
        const location = res.headers.get('location');
        if (res.status === 301 || res.status === 302) {
            if (location && location.includes('accounts.google.com')) {
                console.log(`✅ Google OAuth is CONFIGURED! Redirects to Google.`);
            } else {
                console.log(`⚠️ Redirects to: ${location}`);
                if (location && location.includes('failure')) {
                    console.log(`❌ Google OAuth FAILED — provider may not be configured in Appwrite console.`);
                }
            }
        } else if (res.status === 400) {
            const body = await res.text();
            console.log(`❌ Google OAuth returned 400: ${body}`);
        } else {
            const body = await res.text();
            console.log(`⚠️ Unexpected response: ${body.substring(0, 200)}`);
        }
    } catch (e) {
        console.log(`❌ Google OAuth test FAILED: ${e.message}`);
    }
}

async function testDatabaseAccess() {
    console.log('');
    console.log('--- Test 6: Database Access ---');
    try {
        const res = await databases.listDocuments('tradelense', 'profiles');
        console.log(`✅ Database access works! Found ${res.total} profiles.`);
    } catch (e) {
        console.log(`❌ Database access FAILED. Code: ${e.code}, Type: ${e.type}`);
        console.log(`   Message: ${e.message}`);
    }
}

async function testLogout() {
    console.log('');
    console.log('--- Test 7: Logout ---');
    try {
        await account.deleteSession('current');
        console.log(`✅ Logout succeeded.`);
    } catch (e) {
        console.log(`⚠️ Logout: ${e.message}`);
    }
}

async function testExistingLogin() {
    console.log('');
    console.log('--- Test 8: Login with known credentials ---');
    // Try with the admin email
    try {
        const session = await account.createEmailPasswordSession('heshamfaragallah@gmail.com', 'placeholder');
        console.log(`✅ Login succeeded!`);
    } catch (e) {
        console.log(`   Code: ${e.code}, Type: ${e.type}`);
        console.log(`   Message: ${e.message}`);
        if (e.code === 401) {
            console.log(`   ℹ️ This is expected — wrong password. But the USER EXISTS in Appwrite.`);
        } else if (e.code === 400) {
            console.log(`   ℹ️ Bad request — check if the endpoint or project is correct.`);
        }
    }
}

// RUN ALL TESTS
(async () => {
    await testHealth();
    
    const registered = await testEmailRegister();
    
    if (registered) {
        await testEmailLogin(registered.email, registered.password);
        await testGetUser();
        await testLogout();
    }
    
    await testExistingLogin();
    await testGoogleOAuthURL();
    await testDatabaseAccess();
    
    console.log('');
    console.log('=== DIAGNOSTIC COMPLETE ===');
})();
