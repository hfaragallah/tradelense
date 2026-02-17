import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ Configuration Error: VITE_GEMINI_API_KEY is missing in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Models to test, prioritized by what we want to use
const MODELS = [
    'gemini-2.0-flash',       // Current config
    'gemini-1.5-flash',       // Previous attempt
    'gemini-pro',             // Standard fallback
    'gemini-flash-latest'     // Alias check
];

async function verifyAI() {
    console.log(`🔍 Checking AI Service Configuration...`);
    console.log(`🔑 API Key detected: ${apiKey.substring(0, 8)}...`);

    let workingModel = null;

    for (const modelName of MODELS) {
        process.stdout.write(`👉 Testing model: ${modelName.padEnd(20)} ... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test.");
            const response = await result.response;
            const text = response.text();

            if (text) {
                console.log(`✅ WORKING`);
                if (!workingModel) workingModel = modelName;
            }
        } catch (error) {
            const msg = error.message || error.toString();
            if (msg.includes('404')) {
                console.log(`❌ Not Found (404) - API disabled or valid model name for this key`);
            } else if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
                console.log(`⚠️ Quota Exceeded (429) - Need Billing/Quota`);
            } else {
                console.log(`❌ Error: ${msg.split('\n')[0].substring(0, 50)}...`);
            }
        }
    }

    console.log('\n--- SUMMARY ---');
    if (workingModel) {
        console.log(`🎉 Success! The AI tool is working with model: ${workingModel}`);
        if (workingModel !== 'gemini-2.0-flash') {
            console.log(`💡 Recommendation: Update geminiService.ts to use '${workingModel}'`);
        } else {
            console.log(`✅ Current configuration (gemini-2.0-flash) is correct.`);
        }
    } else {
        console.log(`🛑 AI Tools are NOT working yet.`);
        console.log(`Most likely cause: Billing is not enabled or Quota is exhausted for this project.`);
    }
}

verifyAI();
