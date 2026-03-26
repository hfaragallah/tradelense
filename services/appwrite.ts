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
    DISCUSSIONS: 'posts'
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
            await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profile.$id, {
                points: (profile.points || 0) + amount
            });
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
        const response = await fetch(`${AI_BACKEND_URL}/api/users/id/${userId}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch profile from API');
        }
        const user = await response.json();
        return {
            ...user,
            userId: user.id // Map id to userId for frontend compatibility
        };
    } catch (error) {
        console.error('Error fetching profile from API:', error);
        return null;
    }
}

export async function getProfileByHandle(handle: string) {
    try {
        const response = await fetch(`${AI_BACKEND_URL}/api/users/${handle}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch profile by handle from API');
        }
        const user = await response.json();
        return {
            ...user,
            userId: user.id
        };
    } catch (error) {
        console.error('Error fetching profile by handle from API:', error);
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

        const payload = {
            id: userId,
            email: updates.email || currentProfile.email,
            name: updates.name || currentProfile.name,
            handle: updates.handle || currentProfile.handle,
            avatar_url: updates.avatar || updates.avatar_url || currentProfile.avatar_url,
            reputation: updates.reputationScore !== undefined ? updates.reputationScore : (updates.reputation !== undefined ? updates.reputation : currentProfile.reputation),
            points: updates.points !== undefined ? updates.points : currentProfile.points,
            is_admin: updates.isAdmin !== undefined ? updates.isAdmin : currentProfile.is_admin
        };

        const response = await fetch(`${AI_BACKEND_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to update profile in API');
        return await response.json();
    } catch (error) {
        console.error('Error updating profile in API:', error);
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

        const ADMIN_EMAILS = ['heshamfaragallah@gmail.com', 'hesham-farag@outlook.com'];
        const isHeshamAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());

        const payload = {
            id: user.$id,
            email: user.email,
            name: user.name || (isHeshamAdmin ? 'Hesham Admin' : 'New Trader'),
            handle: existingProfile?.handle || (isHeshamAdmin ? 'hesham_admin' : `user_${user.$id.substring(0, 5)}`),
            avatar_url: avatar || existingProfile?.avatar_url || null,
            reputation: existingProfile?.reputation || (isHeshamAdmin ? 999 : 10),
            points: existingProfile?.points || (isHeshamAdmin ? 50000 : 500),
            is_admin: isHeshamAdmin
        };

        const response = await fetch(`${AI_BACKEND_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to sync profile with API');
        const apiUser = await response.json();
        
        return { 
            profile: { ...apiUser, userId: apiUser.id, avatar: apiUser.avatar_url }, 
            isNew: !existingProfile 
        };
    } catch (error) {
        console.error('Error syncing user profile with API:', error);
        throw error;
    }
}

// --- Trade Feed Functions ---

const AI_BACKEND_URL = import.meta.env.VITE_AI_BACKEND_URL || 'https://tradelense-ai-engine.fly.dev';

export async function createTrade(tradeData: any) {
    try {
        const payload = {
            user_id: tradeData.authorId,
            author_name: tradeData.authorName,
            author_reputation: tradeData.authorReputation || 0,
            asset: tradeData.asset,
            market: tradeData.market,
            type: tradeData.type,
            entry_min: tradeData.entryRange[0],
            entry_max: tradeData.entryRange[1],
            stop_loss: tradeData.stopLoss,
            take_profit: tradeData.takeProfit,
            time_horizon: tradeData.timeHorizon,
            description: tradeData.rationale,
            tags: tradeData.rationaleTags,
            confidence: tradeData.confidenceScore || 0
        };

        const response = await fetch(`${AI_BACKEND_URL}/trades`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create trade: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating trade in API backend:', error);
        throw error;
    }
}

export async function getTrades() {
    try {
        const response = await fetch(`${AI_BACKEND_URL}/trades`);
        if (!response.ok) {
            throw new Error('Failed to fetch trades');
        }
        const trades = await response.json();
        
        // Map from API response to frontend Trade interface
        return trades.map((t: any) => ({
            id: t.id,
            authorId: t.user_id,
            authorName: t.author_name,
            authorReputation: t.author_reputation,
            asset: t.asset,
            market: t.market,
            type: t.type,
            entryRange: [t.entry_min, t.entry_max],
            stopLoss: t.stop_loss,
            takeProfit: t.take_profit,
            timeHorizon: t.time_horizon,
            rationale: t.description,
            rationaleTags: t.tags,
            confidenceScore: t.confidence,
            crowd: t.crowd,
            timestamp: t.created_at,
            imageUrl: t.imageUrl // if added later
        }));
    } catch (error) {
        console.error('Error fetching trades from API backend:', error);
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

export async function createPost(postData: {
    authorId: string;
    authorName: string;
    authorHandle: string;
    authorAvatar?: string;
    title: string;
    content: string;
    tag: string;
}) {
    try {
        const payload = {
            author_id: postData.authorId,
            author_name: postData.authorName,
            author_handle: postData.authorHandle || postData.authorName,
            author_avatar: postData.authorAvatar || null,
            title: postData.title,
            content: postData.content,
            tag: postData.tag,
        };

        const response = await fetch(`${AI_BACKEND_URL}/api/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to create post:', errorText);
            throw new Error(`Failed to create post: ${errorText}`);
        }

        const post = await response.json();
        return {
            id: post.id,
            authorId: post.author_id,
            authorName: post.author_name,
            authorHandle: post.author_handle,
            authorAvatar: post.author_avatar,
            title: post.title,
            content: post.content,
            tag: post.tag,
            upvotes: post.upvotes,
            commentCount: post.comment_count,
            isPinned: post.is_pinned,
            comments: post.comments || [],
            timestamp: post.created_at,
        };
    } catch (error) {
        console.error('Error creating post via API backend:', error);
        throw error;
    }
}

export async function getPosts() {
    try {
        const response = await fetch(`${AI_BACKEND_URL}/api/posts`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch posts:', errorText);
            return [];
        }

        const posts = await response.json();
        return posts.map((post: any) => ({
            id: post.id,
            authorId: post.author_id,
            authorName: post.author_name,
            authorHandle: post.author_handle,
            authorAvatar: post.author_avatar,
            title: post.title,
            content: post.content,
            tag: post.tag,
            upvotes: post.upvotes,
            commentCount: post.comment_count,
            isPinned: post.is_pinned,
            comments: post.comments || [],
            timestamp: post.created_at,
        }));
    } catch (error) {
        console.error('Error fetching posts from API backend:', error);
        return [];
    }
}

export default client;

