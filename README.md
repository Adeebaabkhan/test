# 📊 Complete Sales Tracker System

A powerful sales tracking system with Firebase backend and GitHub Pages frontend.

## ✨ Features

- �� **15+ Color Themes** - Light Blue, Deep Blue, Rose Pink, Violet, Teal, Coral, Mint Green, Red, Dark Purple, Rainbow + more
- 📦 **Smart Product System** - Netflix, CapCut, Spotify, Quizlet with Solo/Shared categories
- 👥 **User Management** - Admins can add unlimited users with custom commissions
- 💰 **Sales Recording** - Track products, accounts, and instant commission calculation
- 💸 **Auto-Reset Payout System** - Mark as paid, archive history, fresh cycles
- 📊 **Analytics Dashboard** - Charts, graphs, and trends
- 🔥 **Real-time Sync** - All admins see updates instantly

## 🚀 Setup Instructions

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Copy your Firebase config
5. Replace the config in js/firebase-config.js
6. Deploy to GitHub Pages

## 📁 Structure

/
├── index.html          # Main dashboard
├── login.html          # Authentication
├── css/
│   └── styles.css     # All styles
├── js/
│   ├── firebase-config.js
│   ├── auth.js
│   ├── products.js
│   ├── sales.js
│   ├── users.js
│   ├── themes.js
│   └── analytics.js
└── README.md

## 🔐 Firebase Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /sales/{saleId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /payouts/{payoutId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}

## 👤 Default Admin

After first deployment, create your admin account in Firebase Console manually.

## 📄 License

MIT