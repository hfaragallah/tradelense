import { Client, Users, ID } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);

async function createAdminUser() {
    try {
        console.log('Creating admin user account...');

        const user = await users.create(
            ID.unique(),
            'heshamfaragallah@gmail.com',
            undefined, // phone (optional)
            'Allahlove12',
            'Hesham Faragalla'
        );

        console.log('✅ Admin user created successfully!');
        console.log('User ID:', user.$id);
        console.log('Email:', user.email);
        console.log('Name:', user.name);
        console.log('\n🎉 You can now login with:');
        console.log('Email: heshamfaragallah@gmail.com');
        console.log('Password: Allahlove12');
        console.log('\n💡 On first login, you\'ll receive:');
        console.log('   - 50,000 points (Admin bonus)');
        console.log('   - Reputation score: 999');
        console.log('   - Admin privileges');

    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️  User already exists! You can login with the existing account.');
            console.log('Email: heshamfaragallah@gmail.com');
            console.log('Password: Allahlove12');
        } else {
            console.error('❌ Error creating user:', error.message);
            throw error;
        }
    }
}

createAdminUser();
