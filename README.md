# Meital — מיטל 🌟

מערכת ניהול תוכנית אימון מקצועית. מתאמנים מקבלים משימות, מרוויחים מטבעות ועוקבים אחר התקדמותם. צוות המנחים מנהל משתמשים, יוצר משימות ומעניק תגמולים.

---

## מבנה המערכת

```
meital-boost/
├── meital-app/          # אפליקציה מובייל (Expo / React Native)
├── meital-admin/        # פאנל ניהול (Next.js)
└── firebase/            # כללי Firestore + seed script
```

---

## טכנולוגיות

| רכיב | טכנולוגיה |
|------|-----------|
| Mobile | Expo SDK 51 + React Native |
| Navigation | Expo Router v3 |
| Backend | Firebase Auth + Firestore |
| Admin | Next.js 14 + Tailwind CSS |
| Build | EAS Build (iOS + Android) |

---

## הגדרה ראשונה

### 1. צור פרויקט Firebase

1. גש ל-[Firebase Console](https://console.firebase.google.com)
2. צור פרויקט חדש
3. הפעל **Authentication** > Email/Password
4. צור **Firestore Database** (Production mode)
5. העתק את פרטי ה-config

### 2. הגדר משתני סביבה

**אפליקציה מובייל:**
```bash
cp meital-app/.env.example meital-app/.env
# מלא את הערכים מ-Firebase Console
```

**פאנל ניהול:**
```bash
cp meital-admin/.env.local.example meital-admin/.env.local
# מלא את הערכים מ-Firebase Console
```

### 3. פרוס כללי Firestore

```bash
npm install -g firebase-tools
firebase login
cd firebase
firebase deploy --only firestore:rules,firestore:indexes
```

### 4. צור מנהל ראשוני

```bash
cd firebase
npm install firebase-admin
FIREBASE_PROJECT_ID=your-project-id node seed.js
```

הסיד ייצור:
- משתמש admin: `admin@meital.app` / `Admin123!`
- 5 משימות לדוגמה

---

## הרצה מקומית

### אפליקציה מובייל

```bash
cd meital-app
npm install
npm start
# סרוק את ה-QR עם Expo Go
```

### פאנל ניהול

```bash
cd meital-admin
npm install
npm run dev
# http://localhost:3001
```

---

## בנייה לפרסום

### Android APK / AAB

```bash
# התקן EAS CLI
npm install -g eas-cli
eas login

cd meital-app
eas build --platform android --profile production
```

### iOS (.ipa)

```bash
cd meital-app
eas build --platform ios --profile production
```

### eas.json נדרש

```json
{
  "cli": { "version": ">= 10.0.0" },
  "build": {
    "production": {
      "android": { "buildType": "apk" },
      "ios": { "simulator": false }
    }
  }
}
```

### פאנל ניהול — Deploy ל-Firebase Hosting

```bash
cd meital-admin
npm run build
cd ../firebase
firebase deploy --only hosting
```

---

## מבנה Firestore

### users
```
{
  id: string,
  name: string,
  email: string,
  phone: string,
  coins: number,
  role: 'trainee' | 'admin',
  createdAt: Timestamp,
  updatedAt?: Timestamp,
  lastRewardedUserTaskId?: string
}
```

### tasks
```
{
  id: string,
  title: string,
  description: string,
  reward: number,
  active: boolean,
  category?: string,
  createdAt: Timestamp
}
```

### user_tasks
```
{
  userId: string,
  taskId: string,
  reward: number,
  status: 'in_progress' | 'completed' | 'approved',
  completedAt?: Timestamp,
  rewardAwarded: boolean,
  rewardedAt?: Timestamp,
  createdAt: Timestamp
}
```

### coins_history
```
{
  userId: string,
  taskId?: string,
  userTaskId?: string,
  amount: number,
  reason: string,
  type: 'task_completion' | 'manual',
  createdAt: Timestamp
}
```

---

## פאנל ניהול — מסכים

| מסך | תיאור |
|-----|--------|
| `/dashboard` | סטטיסטיקות כלליות + טבלת מובילים |
| `/users` | רשימת משתמשים + הענקת מטבעות ידנית |
| `/tasks` | יצירה/עריכה/מחיקה של משימות |
| `/coins` | היסטוריה + הענקה ידנית |
| `/activity` | אישור משימות שהושלמו; מטבעות ניתנים אוטומטית בסיום המשימה ללא כפילות |

---

## אפליקציה מובייל — מסכים

| מסך | תיאור |
|-----|--------|
| Login | התחברות עם אימייל + סיסמה |
| Register | הרשמה עם שם/אימייל/טלפון |
| Onboarding | 3 מצגות קצרות (פעם ראשונה) |
| Home | מטבעות + משימות אחרונות + סטטיסטיקות |
| Tasks | רשימת משימות + סטטוס + התחלה/סיום |
| Coins | יתרה + היסטוריית עסקאות |
| Profile | פרטים אישיים + רמה + הגדרות |

---

## כללי אבטחה

- מתאמן רואה ומעדכן רק את הנתונים שלו
- מנהל ניהול מלא לכל הנתונים
- פאנל ניהול מחייב role === 'admin'
- כתיבה ל-coins_history רק ע"י מנהל

---

## תמיכה

לשאלות ותמיכה, צור קשר עם מנהל המערכת.
