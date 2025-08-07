# 🏠 Room Expense Tracker

A beautiful and functional expense tracking web app built specifically for college students sharing rooms. Track your monthly budget, add daily expenses, and sync data in real-time with your roommates using Firebase Firestore.

## 🚀 Features

- **Monthly Budget Management**: Set and track your monthly room budget with visual indicators
- **Daily Expense Tracking**: Add expenses with title, amount, and date
- **Real-time Data Sync**: All roommates see the same data instantly via Firebase Firestore
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Smart Categories**: Auto-categorization of expenses with color coding
- **Offline Support**: Works even when internet is slow
- **Mobile Responsive**: Optimized for all devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase Firestore (NoSQL Database)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 📋 Prerequisites

Before you start, make sure you have:
- Node.js (version 16 or higher)
- npm or yarn package manager
- A Firebase project (we'll set this up)

## 🔥 Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "room-expense-tracker")
4. Follow the setup wizard (you can disable Google Analytics for now)

### Step 2: Enable Firestore Database

1. In your Firebase project dashboard, click "Firestore Database"
2. Click "Create database"
3. Start in **test mode** (you can secure it later)
4. Choose a location closest to you

### Step 3: Get Your Firebase Configuration

1. Go to Project Settings (gear icon → Project settings)
2. Scroll down to "Your apps" section
3. Click "Web app" icon (`</>`)
4. Register your app with a nickname
5. Copy the Firebase configuration object

### Step 4: Add Configuration to Your Project

Open `src/firebase/config.ts` and replace the placeholder configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "your-actual-app-id"
};
```

## 🚀 Getting Started

### 1. Clone and Install

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Open in Browser

Visit `http://localhost:5173` and start using the app!

## 📱 How to Use

### Setting Up Budget
1. When you first open the app, set your monthly room budget
2. This budget will be shared with all your roommates

### Adding Expenses
1. Click "Add New Expense" 
2. Use quick buttons for common expenses or type custom ones
3. Enter the amount and date
4. Click "Add Expense"

### Managing Expenses
- **View**: All expenses are displayed in chronological order
- **Edit**: Click the edit icon to modify any expense
- **Delete**: Click the trash icon to remove an expense
- **Real-time**: Changes appear instantly for all users

## 🌐 Deployment Options

### Option 1: Netlify (Recommended)
1. Build your project: `npm run build`
2. Drag the `dist` folder to [Netlify Drop](https://app.netlify.com/drop)
3. Share the URL with your roommates

### Option 2: Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy
```

### Option 3: Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts

## 🔒 Security Best Practices

### Firestore Security Rules
After testing, update your Firestore rules for better security:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to budget and expenses
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

For production, consider more restrictive rules based on your needs.

## 🎨 Customization

### Changing Colors
Edit `src/components/*` files to modify the color scheme. The app uses Tailwind CSS classes.

### Adding Features
The app is designed to be easily extensible. You can add:
- User authentication
- Expense categories
- Monthly/yearly reports
- Data export (PDF/CSV)
- Push notifications
- Split expense calculations

### Database Schema
```
budget/
  └── current/
      ├── amount: number
      ├── setAt: string (ISO date)
      ├── month: number
      └── year: number

expenses/
  └── {auto-generated-id}/
      ├── title: string
      ├── amount: number
      ├── date: string (YYYY-MM-DD)
      └── createdAt: string (ISO date)
```

## 🐛 Troubleshooting

### Common Issues

**1. Firebase Connection Error**
- Double-check your Firebase configuration in `src/firebase/config.ts`
- Ensure Firestore is enabled in your Firebase project

**2. Data Not Syncing**
- Check browser console for errors
- Verify your internet connection
- Check Firestore rules allow read/write access

**3. Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Update dependencies: `npm update`

### Getting Help
- Check browser console for detailed error messages
- Verify Firebase project setup
- Test with a simple expense to ensure connection works

## 📈 Future Enhancements

- **User Authentication**: Add login system for personal expense tracking
- **Expense Analytics**: Charts and graphs for spending patterns
- **Export Features**: PDF reports and CSV downloads
- **Notifications**: Remind roommates about pending expenses
- **Split Bills**: Automatically divide expenses among roommates
- **Receipt Upload**: Add photos of receipts
- **Recurring Expenses**: Set up automatic monthly expenses

## 🤝 Contributing

This is a learning project! Feel free to:
1. Fork the repository
2. Add new features
3. Fix bugs
4. Share improvements with friends

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with love for B.Tech students
- Inspired by the need for simple expense tracking
- Thanks to Firebase for providing an excellent backend solution
- UI inspired by modern design principles

---

**Happy expense tracking! 🎉**

*Remember: The best way to learn is by building and experimenting. Don't hesitate to modify the code and make it your own!*