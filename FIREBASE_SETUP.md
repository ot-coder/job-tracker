# Firebase Setup Guide

## 🔐 Security First: Environment Variables

Your Firebase configuration is now properly secured using environment variables. Here's how to set it up:

### 1. Create Environment File

Create a `.env.local` file in your project root with your Firebase configuration:

```bash
# Copy the example file
cp env.example .env.local
```

### 2. Fill in Your Firebase Values

Edit `.env.local` and replace the placeholder values with your actual Firebase config:

```env
# Firebase Web SDK Config
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAKe9axnxu3by8Yu8OFbGNiotnvZ0gHD6I
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=job-tracker-5c116.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=job-tracker-5c116
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=job-tracker-5c116.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=951797603721
NEXT_PUBLIC_FIREBASE_APP_ID=1:951797603721:web:aff5b0e7343316abf51558
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-4GTL0V8L2D

# Firebase Admin SDK Config (for server-side)
FIREBASE_PROJECT_ID=job-tracker-5c116
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key_here
```

### 3. Install Firebase SDK

```bash
pnpm add firebase
```

### 4. Why This Approach is Secure

- ✅ `.env.local` is automatically ignored by Git (see `.gitignore`)
- ✅ Sensitive keys are never committed to version control
- ✅ Different environments can have different configs
- ✅ Follows Next.js best practices

### 5. For Production Deployment

When deploying to platforms like Vercel, add these environment variables in your deployment settings.

## 🚨 Important Security Notes

- **Never commit `.env.local` to Git** - it's already in `.gitignore`
- **Use different Firebase projects** for development and production
- **Rotate API keys** if they ever get exposed
- **Use Firebase Security Rules** to protect your data

## 📁 File Structure

```
job-tracker/
├── .env.local          # Your actual Firebase config (not in Git)
├── env.example         # Template showing required variables
├── .gitignore          # Excludes .env.local from Git
├── lib/
│   ├── firebase.ts     # Client-side Firebase config
│   └── firebase-admin.ts # Server-side Firebase config
└── app/api/            # API routes using Firebase Admin
``` 