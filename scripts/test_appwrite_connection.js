import { Client, Account } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client();
client
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);

async function testConnection() {
    try {
        console.log(`Connecting to: ${process.env.VITE_APPWRITE_ENDPOINT}`);
        console.log(`Project ID: ${process.env.VITE_APPWRITE_PROJECT_ID}`);
        
        try {
            await account.get();
        } catch (e) {
            if (e.code === 401) {
                console.log("✅ Appwrite connection SUCCESSFUL! The project exists and is reachable.");
            } else {
                console.log(`❌ Appwrite connection FAILED. Code: ${e.code}, Message: ${e.message}`);
            }
        }
    } catch (e) {
        console.log(`❌ Script Error: ${e.message}`);
    }
}

testConnection();
