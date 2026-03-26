import { Client, Account, Databases, Storage, ID, OAuthProvider, Query } from 'appwrite';

const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
    console.warn('Appwrite endpoint or project ID is missing from environment variables.');
}

client
    .setEndpoint(endpoint || 'https://fra.cloud.appwrite.io/v1')
    .setProject(projectId || '698d7ab00021a58fe096');

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
    DISCUSSIONS: 'posts',
    CONTACT_MESSAGES: 'contact_messages'
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

export async function followUser(followerId: string, followingId: string) {
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
            await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, (followingProfile as any).$id, {
                followersCount: ((followingProfile as any).followersCount || 0) + 1
            });
        }

        const followerProfile = await getProfile(followerId);
        if (followerProfile) {
            await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, (followerProfile as any).$id, {
                followingCount: ((followerProfile as any).followingCount || 0) + 1
            });
        }

        return true;
    } catch (error) {
        console.error('Error following user:', error);
        throw error;
    }
}

export async function unfollowUser(followerId: string, followingId: string) {
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
                await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, (followingProfile as any).$id, {
                    followersCount: Math.max(0, ((followingProfile as any).followersCount || 0) - 1)
                });
            }

            const followerProfile = await getProfile(followerId);
            if (followerProfile) {
                await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, (followerProfile as any).$id, {
                    followingCount: Math.max(0, ((followerProfile as any).followingCount || 0) - 1)
                });
            }
        }
        return true;
    } catch (error) {
        console.error('Error unfollowing user:', error);
        throw error;
    }
}

export async function getFollowers(userId: string) {
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

export async function getFollowing(userId: string) {
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

export async function checkIsFollowing(followerId: string, followingId: string) {
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

export async function getLeaderboard(limit = 100) {
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

export async function searchUsers(searchTerm: string) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PROFILES,
            [
                Query.or([
                    Query.equal('handle', searchTerm),
                    Query.contains('handle', searchTerm),
                    Query.contains('name', searchTerm)
                ]),
                Query.limit(20)
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error searching users:', error);
        return [];
    }
}

// --- Gamification Functions ---

export async function awardPoints(userId: string, amount: number, action: string) {
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
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.PROFILES,
                (profile as any).$id,
                { points: ((profile as any).points || 0) + amount }
            );
        }
    } catch (error) {
        console.error('Error awarding points:', error);
    }
}


export async function login(email: string, password: string) {
    try {
        return await account.createEmailPasswordSession(email, password);
    } catch (error) {
        throw error;
    }
}

export async function register(email: string, password: string, name: string) {
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

export async function getProfile(userId: string) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PROFILES,
            [Query.equal('userId', userId)]
        );
        if (response.documents.length === 0) return null;
        const user = response.documents[0];
        // Map to TraderProfile interface
        return {
            ...user,
            id: (user as any).userId,
            reputationScore: (user as any).reputationScore || 0,
            points: (user as any).points || 0,
            followersCount: (user as any).followersCount || 0,
            followingCount: (user as any).followingCount || 0,
            winRate: (user as any).winRate || 0,
            totalTrades: (user as any).totalTrades || 0,
            joinedDate: (user as any).$createdAt
        };
    } catch (error) {
        console.error('Error fetching profile from Appwrite:', error);
        return null;
    }
}

export async function getProfileByHandle(handle: string) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PROFILES,
            [Query.equal('handle', handle)]
        );
        if (response.documents.length === 0) return null;
        const user = response.documents[0];
        return {
            ...user,
            id: (user as any).userId,
            reputationScore: (user as any).reputationScore || 0,
            points: (user as any).points || 0,
            followersCount: (user as any).followersCount || 0,
            followingCount: (user as any).followingCount || 0,
            winRate: (user as any).winRate || 0,
            totalTrades: (user as any).totalTrades || 0,
            joinedDate: (user as any).$createdAt
        };
    } catch (error) {
        console.error('Error fetching profile by handle from Appwrite:', error);
        return null;
    }
}

export async function createProfile(profileData: any) {
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

export async function updateProfile(userId: string, updates: any) {
    try {
        const currentProfile = await getProfile(userId);
        if (!currentProfile) return null;

        const data = {
            name: updates.name || (currentProfile as any).name,
            handle: updates.handle || (currentProfile as any).handle,
            avatar: updates.avatar || (currentProfile as any).avatar,
            email: updates.email || (currentProfile as any).email,
            reputationScore: updates.reputationScore !== undefined ? updates.reputationScore : (currentProfile as any).reputationScore,
            points: updates.points !== undefined ? updates.points : (currentProfile as any).points,
            isAdmin: updates.isAdmin !== undefined ? updates.isAdmin : (currentProfile as any).isAdmin,
        };

        return await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.PROFILES,
            (currentProfile as any).$id,
            data
        );
    } catch (error) {
        console.error('Error updating profile in Appwrite:', error);
        throw error;
    }
}

export async function syncUserProfile(user: any) {
    try {
        const existingProfile = await getProfile(user.$id);
        
        // Extract avatar from provider metadata if available
        const avatar = user?.prefs?.avatar_url || 
                       user?.prefs?.picture || 
                       user?.prefs?.photoURL ||
                       user?.user_metadata?.avatar_url ||
                       user?.user_metadata?.picture ||
                       user?.user_metadata?.photoURL;

        const ADMIN_EMAILS = ['heshamfaragalla@gmail.com', 'hesham-farag@outlook.com'];
        const isHeshamAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase());

        const data = {
            userId: user.$id,
            email: user.email,
            name: user.name || (isHeshamAdmin ? 'Hesham Admin' : 'New Trader'),
            handle: (existingProfile as any)?.handle || (isHeshamAdmin ? 'hesham_admin' : `user_${user.$id.substring(0, 5)}`),
            avatar: avatar || (existingProfile as any)?.avatar || null,
            reputationScore: (existingProfile as any)?.reputationScore || (isHeshamAdmin ? 999 : 10),
            points: (existingProfile as any)?.points || (isHeshamAdmin ? 50000 : 500),
            isAdmin: isHeshamAdmin
        };

        if (existingProfile) {
            const updatedProfile = await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.PROFILES,
                (existingProfile as any).$id,
                data
            );
            return { profile: updatedProfile, isNew: false };
        } else {
            const newProfile = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.PROFILES,
                ID.unique(),
                data
            );
            return { profile: newProfile, isNew: true };
        }
    } catch (error) {
        console.error('Error syncing user profile with Appwrite:', error);
        throw error;
    }
}

// --- Trade Feed Functions ---

const AI_BACKEND_URL = import.meta.env.VITE_AI_BACKEND_URL || 'https://tradelense-ai-engine.fly.dev';

export async function createTrade(tradeData: any) {
    try {
        const payload = {
            authorId: tradeData.authorId,
            authorName: tradeData.authorName,
            authorReputation: tradeData.authorReputation || 0,
            asset: tradeData.asset,
            market: tradeData.market,
            type: tradeData.type,
            entryMin: tradeData.entryRange[0],
            entryMax: tradeData.entryRange[1],
            stopLoss: tradeData.stopLoss,
            takeProfit: tradeData.takeProfit,
            timeHorizon: tradeData.timeHorizon,
            rationale: tradeData.rationale,
            rationaleTags: tradeData.rationaleTags || [],
            confidenceScore: tradeData.confidenceScore || 0,
            imageUrl: tradeData.imageUrl || null,
            timestamp: new Date().toISOString()
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
            [Query.orderDesc('timestamp'), Query.limit(100)]
        );

        return response.documents.map((trade: any) => ({
            id: trade.$id,
            authorId: trade.authorId,
            authorName: trade.authorName,
            authorReputation: trade.authorReputation,
            asset: trade.asset,
            market: trade.market,
            type: trade.type,
            entryRange: [trade.entryMin, trade.entryMax] as [number, number],
            stopLoss: trade.stopLoss,
            takeProfit: trade.takeProfit,
            timeHorizon: trade.timeHorizon,
            rationale: trade.rationale,
            rationaleTags: trade.rationaleTags,
            confidenceScore: trade.confidenceScore,
            crowd: trade.crowd || { agree: 0, disagree: 0, wait: 0, totalVotes: 0 },
            timestamp: trade.timestamp,
            aiReportsCount: trade.aiReportsCount || 0,
            imageUrl: trade.imageUrl
        }));
    } catch (error) {
        console.error('Error fetching trades from Appwrite:', error);
        return [];
    }
}

// --- Discussion Functions ---

export async function createDiscussion(discussionData: any) {
    try {
        const document = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.DISCUSSIONS,
            ID.unique(),
            {
                authorId: discussionData.authorId,
                authorName: discussionData.authorName,
                authorHandle: discussionData.authorHandle || discussionData.authorName, // fallback
                authorAvatar: discussionData.authorAvatar || null,
                title: discussionData.title,
                content: discussionData.content,
                tag: discussionData.tag,
                upvotes: 0,
                commentCount: 0,
                isPinned: false,
                timestamp: new Date().toISOString(),
                comments: '[]' // initialized as empty JSON array
            }
        );

        return {
            ...document,
            id: document.$id,
            comments: [] // parsed to empty array for frontend
        };
    } catch (error) {
        console.error('Error creating discussion in Appwrite:', error);
        throw error;
    }
}


export async function getDiscussions() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.DISCUSSIONS,
            [
                Query.orderDesc('timestamp'),
                Query.limit(50)
            ]
        );

        return response.documents.map((doc: any) => {
            let parsedComments = [];
            try {
                if (doc.comments) {
                    parsedComments = JSON.parse(doc.comments);
                }
            } catch (e) {
                console.warn('Failed to parse comments JSON for post', doc.$id);
            }

            return {
                id: doc.$id,
                authorId: doc.authorId,
                authorName: doc.authorName,
                authorHandle: doc.authorHandle,
                authorAvatar: doc.authorAvatar,
                title: doc.title,
                content: doc.content,
                tag: doc.tag,
                upvotes: doc.upvotes || 0,
                commentCount: doc.commentCount || 0,
                isPinned: doc.isPinned || false,
                comments: parsedComments,
                timestamp: doc.timestamp || doc.$createdAt
            };
        });
    } catch (error) {
        console.error('Error fetching discussions from Appwrite:', error);
        return [];
    }
}

// Feedback functions
export async function createFeedback(feedbackData: any) {
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

export async function getUserFeedback(userId: string) {
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

export async function updateFeedback(feedbackId: string, updates: any) {
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

// --- Post Feed Functions (via AI Backend) ---

export async function createPost(postData: any) {
    try {
        const payload = {
            authorId: postData.authorId,
            authorName: postData.authorName,
            authorHandle: postData.authorHandle,
            authorAvatar: postData.authorAvatar,
            title: postData.title,
            content: postData.content,
            tag: postData.tag,
            upvotes: 0,
            commentCount: 0,
            isPinned: false,
            comments: JSON.stringify([]),
            createdAt: new Date().toISOString(),
            timestamp: new Date().toISOString()
        };

        const doc = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.DISCUSSIONS,
            ID.unique(),
            payload
        );
        return {
            ...doc,
            id: doc.$id,
            timestamp: (doc as any).createdAt
        };
    } catch (error) {
        console.error('Error creating post in Appwrite:', error);
        throw error;
    }
}

export async function getPosts() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.DISCUSSIONS,
            [Query.limit(100)] // We'll sort manually if needed or just use default.
        );

        // Sort manually by date for robustness if multiple potential fields exist
        return response.documents.map((post: any) => ({
            id: post.$id,
            authorId: post.authorId,
            authorName: post.authorName,
            authorHandle: post.authorHandle || `user_${post.authorId.substring(0, 5)}`,
            authorAvatar: post.authorAvatar,
            title: post.title,
            content: post.content,
            tag: post.tag,
            upvotes: post.upvotes || 0,
            commentCount: post.commentCount || 0,
            isPinned: post.isPinned || false,
            comments: post.comments ? (typeof post.comments === 'string' ? JSON.parse(post.comments) : post.comments) : [],
            timestamp: post.createdAt || post.timestamp || new Date().toISOString(),
        })).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
        console.error('Error fetching posts from Appwrite:', error);
        return [];
    }
}

export async function submitContactForm(data: { name: string; email: string; subject: string; message: string; }) {
    try {
        return await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.CONTACT_MESSAGES,
            ID.unique(),
            {
                name: data.name,
                email: data.email,
                subject: data.subject,
                message: data.message,
                status: 'pending',
                timestamp: new Date().toISOString()
            }
        );
    } catch (error) {
        console.error('Error submitting contact form:', error);
        throw error;
    }
}

export default client;
