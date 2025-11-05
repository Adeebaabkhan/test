/**
 * Firebase Configuration File
 * 
 * This file contains your Firebase project configuration.
 * Follow the steps below to set up Firebase for your project.
 * 
 * Created: 2025-11-05 13:34:33 UTC
 * Author: Adeebaabkhan
 */

// ===========================
// STEP 1: CREATE FIREBASE PROJECT
// ===========================
/*
1. Go to: https://console.firebase.google.com/
2. Click "Add project" or "Create a project"
3. Enter project name: "sales-tracker" (or any name you like)
4. Disable Google Analytics (optional)
5. Click "Create project"
6. Wait for project creation to complete
*/

// ===========================
// STEP 2: ENABLE REALTIME DATABASE
// ===========================
/*
1. In Firebase Console, click "Realtime Database" from left menu
2. Click "Create Database"
3. Select location: United States (or closest to you)
4. Start in TEST MODE (for now)
5. Click "Enable"

IMPORTANT: Update Security Rules
Go to "Rules" tab and paste this:

{
  "rules": {
    ".read": "auth == null || auth != null",
    ".write": "auth == null || auth != null"
  }
}

Then click "Publish"

NOTE: For production, you should implement proper security rules!
*/

// ===========================
// STEP 3: GET YOUR CONFIG KEYS
// ===========================
/*
1. Click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon </> to add a web app
5. Enter app nickname: "sales-tracker-web"
6. Click "Register app"
7. Copy the firebaseConfig object shown
8. Paste it in the section below
*/

// ===========================
// YOUR FIREBASE CONFIGURATION
// ===========================

export const firebaseConfig = {
    // REPLACE THESE VALUES WITH YOUR OWN FROM FIREBASE CONSOLE
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "your-project-12345.firebaseapp.com",
    databaseURL: "https://your-project-12345-default-rtdb.firebaseio.com",
    projectId: "your-project-12345",
    storageBucket: "your-project-12345.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// ===========================
// EXAMPLE CONFIGURATION
// ===========================
/*
Here's what a real config looks like (THIS IS FAKE - USE YOUR OWN):

export const firebaseConfig = {
    apiKey: "AIzaSyC1Kx8j9YZ3mLpQrStUvWxYz4aBcDeFgHi",
    authDomain: "sales-tracker-abc123.firebaseapp.com",
    databaseURL: "https://sales-tracker-abc123-default-rtdb.firebaseio.com",
    projectId: "sales-tracker-abc123",
    storageBucket: "sales-tracker-abc123.appspot.com",
    messagingSenderId: "987654321098",
    appId: "1:987654321098:web:a1b2c3d4e5f6g7h8i9j0k1"
};
*/

// ===========================
// STEP 4: UPDATE index.html & dashboard.html
// ===========================
/*
Replace the firebaseConfig in both files with your actual config:

In index.html (around line 160):
const firebaseConfig = {
    // YOUR CONFIG HERE
};

In app.js (around line 8):
const firebaseConfig = {
    // YOUR CONFIG HERE
};
*/

// ===========================
// STEP 5: TEST YOUR SETUP
// ===========================
/*
1. Open index.html in your browser
2. Try logging in with: kirs / kirs123
3. If login works, Firebase is connected!
4. Check Firebase Console > Realtime Database
5. You should see "users" node created with 4 accounts
*/

// ===========================
// DATABASE STRUCTURE (Auto-created)
// ===========================
/*
Your Firebase Realtime Database will have this structure:

sales-tracker-db/
├── users/
│   ├── kirs/
│   │   ├── name: "Kirs"
│   │   ├── password: "a2lyczEyMw==" (Base64 encoded)
│   │   ├── role: "owner"
│   │   ├── commission: 100
│   │   ├── avatar: "👑"
│   │   └── created_at: "2025-11-05 13:34:33"
│   ├── aab/
│   ├── barbie/
│   └── shee/
│
├── products/
│   └── -O1234abcd/
│       ├── name: "Netflix 1 Month"
│       ├── emoji: "🎬"
│       ├── category: "solo"
│       ├── duration: "1 Month"
│       ├── price: 200
│       ├── cost: 150
│       ├── profit: 50
│       ├── stock: 10
│       ├── created_by: "kirs"
│       └── created_at: "2025-11-05 13:34:33"
│
├── sales/
│   └── -O5678efgh/
│       ├── product_id: "-O1234abcd"
│       ├── account_sold: "netflix_acc_12@email.com"
│       ├── price: 200
│       ├── cost: 150
│       ├── profit: 50
│       ├── commission: 10
│       ├── owner_commission: 40
│       ├── sold_by: "aab"
│       ├── sold_at: "2025-11-05 13:34:33"
│       └── payout_status: "pending"
│
└── payouts/
    └── -O9012ijkl/
        ├── user_id: "aab"
        ├── amount: 350
        ├── sales_count: 25
        ├── period_start: "2025-11-01"
        ├── period_end: "2025-11-05"
        ├── paid_at: "2025-11-05 13:34:33"
        └── paid_by: "kirs"
*/

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Get current date/time in UTC format
 * Format: YYYY-MM-DD HH:MM:SS
 */
export function getCurrentDateTime() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format currency to Philippine Peso
 */
export function formatCurrency(amount) {
    return '₱' + parseFloat(amount).toLocaleString('en-PH', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

/**
 * Encode password to Base64
 */
export function encodePassword(password) {
    return btoa(password);
}

/**
 * Decode password from Base64
 */
export function decodePassword(encoded) {
    return atob(encoded);
}

/**
 * Generate unique ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Calculate commission
 */
export function calculateCommission(profit, commissionPercent) {
    return (profit * commissionPercent) / 100;
}

// ===========================
// DEFAULT USER ACCOUNTS
// ===========================

export const DEFAULT_USERS = {
    kirs: {
        name: "Kirs",
        password: "a2lyczEyMw==", // kirs123
        role: "owner",
        commission: 100,
        avatar: "👑"
    },
    aab: {
        name: "Aab",
        password: "bWVvdzEyMw==", // meow123
        role: "admin",
        commission: 20,
        avatar: "🐱"
    },
    barbie: {
        name: "Barbie",
        password: "bWVvdzEyMw==", // meow123
        role: "admin",
        commission: 15,
        avatar: "💖"
    },
    shee: {
        name: "Shee",
        password: "bWVvdzEyMw==", // meow123
        role: "admin",
        commission: 25,
        avatar: "🌸"
    }
};

// ===========================
// PRESET PRODUCTS (Optional)
// ===========================

export const PRESET_PRODUCTS = [
    {
        name: "Netflix",
        emoji: "🎬",
        durations: ["1 Month", "3 Months", "6 Months", "1 Year"],
        categories: ["solo", "shared"]
    },
    {
        name: "CapCut",
        emoji: "🎬",
        durations: ["1 Month", "3 Months", "6 Months", "1 Year"],
        categories: ["solo", "shared"]
    },
    {
        name: "Spotify",
        emoji: "🎵",
        durations: ["1 Month", "3 Months", "6 Months", "1 Year"],
        categories: null
    },
    {
        name: "Quizlet",
        emoji: "📚",
        durations: ["1 Month", "3 Months", "6 Months", "1 Year"],
        categories: null
    },
    {
        name: "YouTube Premium",
        emoji: "▶️",
        durations: ["1 Month", "3 Months", "6 Months", "1 Year"],
        categories: null
    },
    {
        name: "Canva Pro",
        emoji: "🎨",
        durations: ["1 Month", "3 Months", "6 Months", "1 Year"],
        categories: null
    }
];

// ===========================
// TROUBLESHOOTING
// ===========================
/*
❌ ERROR: "Firebase: Error (auth/api-key-not-valid)"
✅ SOLUTION: Double-check your apiKey in firebaseConfig

❌ ERROR: "Permission denied"
✅ SOLUTION: Update Database Rules in Firebase Console

❌ ERROR: "Firebase App not initialized"
✅ SOLUTION: Make sure firebaseConfig is correct

❌ ERROR: "Cannot read property of undefined"
✅ SOLUTION: Check your database URL is correct

❌ ERROR: Login not working
✅ SOLUTION: Check browser console for errors, verify Firebase is connected

❌ ERROR: Data not syncing
✅ SOLUTION: Check internet connection, verify Database Rules allow read/write

❌ ERROR: "Failed to fetch"
✅ SOLUTION: Make sure you're running on a server (use Live Server extension)
*/

// ===========================
// GITHUB PAGES DEPLOYMENT
// ===========================
/*
1. Push all files to your GitHub repository
2. Go to repository Settings > Pages
3. Source: Deploy from a branch
4. Branch: main (or master)
5. Folder: / (root)
6. Click Save
7. Wait 1-2 minutes for deployment
8. Access at: https://adeebaabkhan.github.io/abd/

IMPORTANT: Make sure these files are in your repo:
- index.html
- dashboard.html
- app.js
- firebase-config.js (optional, config is in app.js)
- README.md

Your live URL will be:
https://adeebaabkhan.github.io/abd/
*/

// ===========================
// SECURITY NOTES (IMPORTANT!)
// ===========================
/*
⚠️ CURRENT SETUP: Test mode (anyone can read/write)

🔒 FOR PRODUCTION, UPDATE RULES TO:

{
  "rules": {
    "users": {
      ".read": true,
      "$userId": {
        ".write": "auth.uid === $userId || root.child('users').child(auth.uid).child('role').val() === 'owner'"
      }
    },
    "products": {
      ".read": true,
      ".write": "root.child('users').child(auth.uid).exists()"
    },
    "sales": {
      ".read": "root.child('users').child(auth.uid).exists()",
      ".write": "root.child('users').child(auth.uid).exists()"
    },
    "payouts": {
      ".read": "root.child('users').child(auth.uid).exists()",
      ".write": "root.child('users').child(auth.uid).child('role').val() === 'owner'"
    }
  }
}

NOTE: Since we're using session-based auth (not Firebase Auth),
keep it simple for now or implement Firebase Authentication later.
*/

// ===========================
// BACKUP & EXPORT
// ===========================
/*
To backup your Firebase data:

1. Go to Firebase Console
2. Realtime Database
3. Click ⋮ (three dots) menu
4. Export JSON
5. Save the file

To import data:
1. Click ⋮ (three dots) menu
2. Import JSON
3. Select your backup file
*/

console.log('🔥 Firebase config loaded');
console.log('📅 Current UTC time:', getCurrentDateTime());
console.log('👤 Logged in as:', 'Adeebaabkhan');
