# 🚀 Complete Setup Guide - Room Expense Tracker

This guide will walk you through setting up your Room Expense Tracker from scratch, including Firebase configuration and deployment.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Local Development Setup](#local-development-setup)
4. [Configuration](#configuration)
5. [Testing Your App](#testing-your-app)
6. [Deployment](#deployment)
7. [Sharing with Roommates](#sharing-with-roommates)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### What You Need:
- A computer with internet access
- Basic understanding of using terminal/command prompt
- A Google account (for Firebase)

### Software to Install:
1. **Node.js** (version 16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Choose the LTS (Long Term Support) version
   - Verify installation: Open terminal and type `node --version`

2. **Code Editor** (recommended)
   - [VS Code](https://code.visualstudio.com/) (free and popular)
   - Or any text editor you prefer

## Firebase Project Setup

### Step 1: Create Firebase Project

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `room-expense-tracker` (or any name you like)
4. Click **Continue**
5. Disable Google Analytics (you can enable later if needed)
6. Click **Create project**
7. Wait for project creation, then click **Continue**

### Step 2: Set Up Firestore Database

1. In your Firebase dashboard, find **"Firestore Database"** in the left menu
2. Click **"Create database"**
3. **Start in test mode** (select this option)
   - This allows read/write access for testing
   - We'll secure it later if needed
4. Choose database location (select closest to your location)
5. Click **Done**

### Step 3: Get Your Web App Configuration

1. In Firebase dashboard, click the **gear icon** (⚙️) → **Project settings**
2. Scroll down to **"Your apps"** section
3. Click the **web icon** `</>`
4. Enter app nickname: `room-tracker-web`
5. **Don't check** "Also set up Firebase Hosting" for now
6. Click **Register app**
7. **IMPORTANT**: Copy the entire `firebaseConfig` object
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123:web:abc123"
   };
   ```
8. Keep this safe - you'll need it in the next step
9. Click **Continue to console**

## Local Development Setup

### Step 1: Set Up the Project

1. Open terminal/command prompt
2. Navigate to where you want to create the project
3. The project files are already created, so navigate to your project directory
4. Install dependencies:
   ```bash
   npm install
   ```

### Step 2: Configure Firebase

1. Open `src/firebase/config.ts` in your code editor
2. Replace the placeholder configuration with your actual Firebase config:

   **Replace this:**
   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key-here",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

   **With your actual config** (from Firebase Console):
   ```typescript
   const firebaseConfig = {
     apiKey: "AIzaSyC-your-actual-api-key",
     authDomain: "room-expense-tracker-12345.firebaseapp.com",
     projectId: "room-expense-tracker-12345",
     storageBucket: "room-expense-tracker-12345.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   };
   ```

3. Save the file

### Step 3: Start Development Server

1. In terminal, run:
   ```bash
   npm run dev
   ```
2. Open your browser and go to: `http://localhost:5173`
3. You should see your expense tracker app! 🎉

## Testing Your App

### Basic Functionality Test:

1. **Set Budget**: 
   - Enter a monthly budget (e.g., 5000)
   - Click "Set Budget"
   - You should see budget cards appear

2. **Add Expense**:
   - Click "Add New Expense"
   - Enter title: "Test Expense"
   - Enter amount: "100"
   - Select today's date
   - Click "Add Expense"

3. **Verify Data Persistence**:
   - Refresh the page (Ctrl+F5 or Cmd+R)
   - Your budget and expense should still be there
   - This confirms Firebase is working!

### Multi-User Test:

1. Open the same URL in a different browser or incognito tab
2. Add an expense from the second browser
3. Check if it appears in the first browser (should happen instantly!)

## Deployment

### Option 1: Netlify (Easiest)

1. **Build your project**:
   ```bash
   npm run build
   ```
   This creates a `dist` folder with your website files.

2. **Deploy to Netlify**:
   - Go to [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag and drop your `dist` folder onto the page
   - Wait for deployment (usually 1-2 minutes)
   - Copy the generated URL (e.g., `https://quirky-name-123456.netlify.app`)

### Option 2: Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize hosting**:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory to: `dist`
   - Configure as single-page app: `Yes`
   - Overwrite index.html: `No`

4. **Build and deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

### Option 3: Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Choose default settings

## Sharing with Roommates

### Getting the URL:
- **Netlify**: Copy the URL from deployment (e.g., `https://amazing-app-123.netlify.app`)
- **Firebase**: URL will be `https://your-project-id.web.app`
- **Vercel**: Copy URL from deployment output

### Share Instructions:
Send this message to your roommates:

```
🏠 Our Room Expense Tracker is ready!

URL: [YOUR-DEPLOYED-URL]

How to use:
1. Open the link on your phone/computer
2. Add expenses as you spend
3. Check our budget status anytime
4. All changes sync in real-time!

Bookmark it for quick access 📌
```

## Troubleshooting

### Common Issues and Solutions:

#### 1. "Firebase not defined" or connection errors
**Problem**: Firebase configuration is incorrect
**Solution**: 
- Double-check your `src/firebase/config.ts` file
- Ensure you copied the ENTIRE config object from Firebase Console
- Make sure there are no extra quotes or missing commas

#### 2. "Permission denied" errors
**Problem**: Firestore rules are too restrictive
**Solution**:
- Go to Firebase Console → Firestore Database → Rules
- Ensure rules allow read/write:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

#### 3. App doesn't load after deployment
**Problem**: Build or deployment configuration issue
**Solution**:
- Check browser console for errors
- Ensure `npm run build` completed without errors
- Verify all files in `dist` folder were uploaded

#### 4. Data not syncing between users
**Problem**: Network or Firebase configuration
**Solution**:
- Test with different browsers/devices
- Check browser console for errors
- Verify Firebase project is active

#### 5. "Module not found" errors
**Problem**: Dependencies not installed properly
**Solution**:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Getting Help:

1. **Check Browser Console**: Press F12 → Console tab for error messages
2. **Firebase Console**: Check if data is being saved in Firestore
3. **Network Tab**: Verify API calls are working
4. **Community**: Search for specific error messages online

### Emergency Reset:

If something goes completely wrong:
1. Create a new Firebase project
2. Replace the configuration in `src/firebase/config.ts`
3. Restart development server: `npm run dev`

## Next Steps

### After Basic Setup:
1. **Secure Your Database**: Update Firestore rules for production use
2. **Custom Domain**: Connect a custom domain to your deployed app
3. **Add Features**: Explore adding user authentication, categories, etc.
4. **Monitor Usage**: Check Firebase Console for usage statistics

### Learning Opportunities:
- Study the code to understand React and Firebase integration
- Try modifying the design or adding new features
- Experiment with different Firebase services

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Guide](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Congratulations! 🎉 You've successfully set up your Room Expense Tracker!**

If you run into any issues, don't panic - building web apps involves lots of troubleshooting, and that's part of the learning process. Take it step by step, and you'll get it working!