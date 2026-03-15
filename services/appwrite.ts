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

// Verify Appwrite backend connection on startup
client.ping().then(() => {
    console.log('✅ Appwrite connection verified');
}).catch((err) => {
    console.warn('⚠️ Appwrite ping failed:', err.message);
});

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = 'tradelense';
export const COLLECTIONS = {
    TRADES: 'trades',
    PROFILES: 'profiles',
    FEEDBACK: 'feedback',
    FOLLOWS: 'follows',
    POINTS_HISTORY: 'points_history',
    HIVE_REGISTRATIONS: 'hive_registrations',
    DISCUSSIONS: 'discussions'
};

// ... existing login/register ...

export async function registerForHive(email: string, preference: string, source: string = 'web') {
    try {
        return await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.HIVE_REGISTRATIONS,
            ID.unique(),
            {
                email,
                preference,
                source,
                timestamp: new Date().toISOString()
            }
        );
    } catch (error) {
        console.error('Error registering for Hive:', error);
        throw error;
    }
}

// ... existing login/register ...

// --- Social Functions ---

export async function followUser(followerId, followingId) {
    try {
        // Create follow record
        await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.FOLLOWS,
            ID.unique(),
            { followerId, followingId, timestamp: new Date().toISOString() }
        );

        // Update counts (optimistic or separate logic needed for strict consistency)
        // Note: Ideally use Appwrite Functions for increments to be atomic
        const followingProfile = await getProfile(followingId);
        if (followingProfile) {
            await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, followingProfile.$id, {
                followersCount: (followingProfile.followersCount || 0) + 1
            });
        }

        const followerProfile = await getProfile(followerId);
        if (followerProfile) {
            await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, followerProfile.$id, {
                followingCount: (followerProfile.followingCount || 0) + 1
            });
        }

        return true;
    } catch (error) {
        console.error('Error following user:', error);
        throw error;
    }
}

export async function unfollowUser(followerId, followingId) {
    try {
        // Find the document first
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FOLLOWS,
            [
                Query.equal('followerId', followerId),
                Query.equal('followingId', followingId)
            ]
        );

        if (response.documents.length > 0) {
            await databases.deleteDocument(DATABASE_ID, COLLECTIONS.FOLLOWS, response.documents[0].$id);

            // Decrement counts
            const followingProfile = await getProfile(followingId);
            if (followingProfile) {
                await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, followingProfile.$id, {
                    followersCount: Math.max(0, (followingProfile.followersCount || 0) - 1)
                });
            }

            const followerProfile = await getProfile(followerId);
            if (followerProfile) {
                await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, followerProfile.$id, {
                    followingCount: Math.max(0, (followerProfile.followingCount || 0) - 1)
                });
            }
        }
        return true;
    } catch (error) {
        console.error('Error unfollowing user:', error);
        throw error;
    }
}

export async function getFollowers(userId) {
    try {
        return await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FOLLOWS,
            [Query.equal('followingId', userId)]
        );
    } catch (error) {
        return { documents: [], total: 0 };
    }
}

export async function getFollowing(userId) {
    try {
        return await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FOLLOWS,
            [Query.equal('followerId', userId)]
        );
    } catch (error) {
        return { documents: [], total: 0 };
    }
}

export async function checkIsFollowing(followerId, followingId) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FOLLOWS,
            [
                Query.equal('followerId', followerId),
                Query.equal('followingId', followingId)
            ]
        );
        return response.documents.length > 0;
    } catch (error) {
        return false;
    }
}

// --- Leaderboard Functions ---

export async function getLeaderboard(limit = 10) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PROFILES,
            [
                Query.orderDesc('reputationScore'),
                Query.limit(limit)
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

// --- Gamification Functions ---

export async function awardPoints(userId, amount, action) {
    try {
        // Log history
        await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.POINTS_HISTORY,
            ID.unique(),
            { userId, points: amount, action, timestamp: new Date().toISOString() }
        );

        // Update profile
        const profile = await getProfile(userId);
        if (profile) {
            await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profile.$id, {
                points: (profile.points || 0) + amount
            });
        }
    } catch (error) {
        console.error('Error awarding points:', error);
    }
}


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
        // Silently handle — no active session to delete is fine
        console.warn('Logout: no active session to delete');
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

export async function createRecovery(email: string) {
    try {
        // Redirect back to our site's reset password page
        const redirectUrl = `${window.location.origin}/reset-password`;
        return await account.createRecovery(email, redirectUrl);
    } catch (error) {
        throw error;
    }
}

export async function updateRecovery(userId: string, secret: string, password: string) {
    try {
        return await account.updateRecovery(userId, secret, password);
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

export async function updateProfile(userId, updates) {
    try {
        const profile = await getProfile(userId);
        if (profile) {
            return await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.PROFILES,
                profile.$id,
                updates
            );
        }
        return null;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

// --- Trade Feed Functions ---

export async function createTrade(tradeData) {
    try {
        // Appwrite requires stringified JSON for custom object arrays (like crowd or takeProfit)
        // If your collection schema has them as simple string arrays, ensure tradeData matches
        const payload = {
            ...tradeData,
            takeProfit: tradeData.takeProfit ? tradeData.takeProfit.map(String) : [],
            entryRange: tradeData.entryRange ? tradeData.entryRange.map(String) : [],
            crowd: tradeData.crowd ? JSON.stringify(tradeData.crowd) : null
        };

        return await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.TRADES,
            ID.unique(),
            payload
        );
    } catch (error) {
        console.error('Error creating trade in Appwrite:', error);
        throw error;
    }
}

export async function getTrades() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TRADES,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(50)
            ]
        );

        // Map back from Appwrite string arrays to your Trade interface types
        return response.documents.map(doc => ({
            ...doc,
            id: doc.$id,
            takeProfit: doc.takeProfit ? doc.takeProfit.map(Number) : [],
            entryRange: doc.entryRange ? doc.entryRange.map(Number) : [],
            crowd: doc.crowd && typeof doc.crowd === 'string' ? JSON.parse(doc.crowd) : { agree: 0, disagree: 0, wait: 0, totalVotes: 0 },
            timestamp: doc.$createdAt,
            authorReputation: doc.authorReputation || 0
        }));
    } catch (error) {
        console.error('Error fetching trades from Appwrite:', error);
        return [];
    }
}

// --- Discussion Functions ---

export async function createDiscussion(discussionData) {
    try {
        const payload = {
            ...discussionData,
            comments: discussionData.comments ? JSON.stringify(discussionData.comments) : '[]'
        };

        return await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.DISCUSSIONS,
            ID.unique(),
            payload
        );
    } catch (error) {
        console.error('Error creating discussion:', error);
        throw error;
    }
}

export async function getDiscussions() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.DISCUSSIONS,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(50)
            ]
        );

        return response.documents.map(doc => ({
            ...doc,
            id: doc.$id,
            comments: doc.comments ? JSON.parse(doc.comments) : [],
            timestamp: doc.$createdAt
        }));
    } catch (error) {
        console.error('Error fetching discussions:', error);
        return [];
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
            COLLECTIONS.FEEDBACK,
            [
                Query.orderDesc('$createdAt'), // Newest first
                Query.limit(100)
            ]
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
