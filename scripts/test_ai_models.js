import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Note: Use the variable name from .env which is now VITE_GEMINI_API_KEY
const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API Key found!");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const MODELS_TO_TEST = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.0-pro'
];

async function testModels() {
    console.log(`Testing API Key: ${apiKey.substring(0, 10)}...`);

    for (const modelName of MODELS_TO_TEST) {
        console.log(`\nTesting model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you working?");
            const response = await result.response;
            console.log(`✅ SUCCESS: ${modelName} responded.`);
        } catch (error) {
            console.log(`❌ FAILED: ${modelName}`);
            // Extract core error message
            const msg = error.message || error.toString();
            if (msg.includes('404')) console.log(`   Error: 404 Not Found`);
            else console.log(`   Error: ${msg.substring(0, 100)}...`);
        }
    }
}

testModels();
