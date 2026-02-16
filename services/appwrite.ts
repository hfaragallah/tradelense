import { Client, Account, Databases, Storage, ID, OAuthProvider, Query } from 'appwrite';

const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
    console.warn('Appwrite endpoint or project ID is missing from environment variables.');
}

client
    .setEndpoint(endpoint || 'https://cloud.appwrite.io/v1')
    .setProject(projectId || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = 'tradelense';
export const COLLECTIONS = {
    TRADES: 'trades',
    PROFILES: 'profiles',
    FEEDBACK: 'feedback',
};

export async function login(email, password) {
    try {
        return await account.createEmailPasswordSession(email, password);
    } catch (error) {
        throw error;
    }
}

export async function register(email, password, name) {
    try {
        await account.create(ID.unique(), email, password, name);
        return await login(email, password);
    } catch (error) {
        throw error;
    }
}

export async function logout() {
    try {
        return await account.deleteSession('current');
    } catch (error) {
        throw error;
    }
}

export async function getUser() {
    try {
        return await account.get();
    } catch (error) {
        return null;
    }
}

export async function googleLogin() {
    try {
        // Redirects to Google OAuth flow
        account.createOAuth2Session(OAuthProvider.Google, window.location.origin, window.location.origin);
    } catch (error) {
        throw error;
    }
}

export async function getProfile(userId) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PROFILES,
            [Query.equal('userId', userId)]
        );
        return response.documents.length > 0 ? response.documents[0] : null;
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null; // Don't throw, just return null if not found (or error)
    }
}

export async function createProfile(profileData) {
    try {
        return await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.PROFILES,
            ID.unique(),
            profileData
        );
    } catch (error) {
        throw error;
    }
}

// Feedback functions
export async function createFeedback(feedbackData) {
    try {
        return await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.FEEDBACK,
            ID.unique(),
            feedbackData
        );
    } catch (error) {
        throw error;
    }
}

export async function getUserFeedback(userId) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FEEDBACK,
            [Query.equal('userId', userId)]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching user feedback:', error);
        return [];
    }
}

export async function getAllFeedback() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FEEDBACK
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching feedback:', error);
        return [];
    }
}

export async function updateFeedback(feedbackId, updates) {
    try {
        return await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.FEEDBACK,
            feedbackId,
            updates
        );
    } catch (error) {
        throw error;
    }
}

export default client;
