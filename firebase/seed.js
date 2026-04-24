/**
 * Firebase seed script - run with: node seed.js
 * Creates an admin user and sample tasks.
 *
 * Prerequisites:
 *   npm install firebase-admin
 *   Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account JSON path
 */

const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id',
});

const db = admin.firestore();
const auth = admin.auth();

async function seed() {
  console.log('Seeding Firebase...');

  // Create admin user
  let adminUser;
  try {
    adminUser = await auth.createUser({
      email: 'admin@meital.app',
      password: 'Admin123!',
      displayName: 'מנהל מיטל',
    });
    console.log('Admin user created:', adminUser.uid);
  } catch (e) {
    const existing = await auth.getUserByEmail('admin@meital.app');
    adminUser = existing;
    console.log('Admin user already exists:', adminUser.uid);
  }

  await db.collection('users').doc(adminUser.uid).set({
    id: adminUser.uid,
    name: 'מנהל מיטל',
    email: 'admin@meital.app',
    phone: '050-0000000',
    coins: 0,
    role: 'admin',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Sample tasks
  const tasks = [
    {
      title: 'השלם 30 דקות פעילות גופנית',
      description: 'בצע אימון של 30 דקות לפחות — ריצה, הליכה, אימון כוח, או כל פעילות אחרת. תעד את הפעילות.',
      reward: 20,
      active: true,
      category: 'כושר',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      title: 'קרא פרק בספר מקצועי',
      description: 'קרא לפחות פרק אחד מספר מקצועי בתחום שלך. כתוב תקציר קצר של מה שלמדת.',
      reward: 15,
      active: true,
      category: 'למידה',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      title: 'שתף את הצוות בתובנה',
      description: 'שתף בקבוצת הווצאפ של הצוות תובנה מקצועית, רעיון חדש, או משהו שלמדת השבוע.',
      reward: 25,
      active: true,
      category: 'צוות',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      title: 'השלם יעד שבועי',
      description: 'הגדר יעד בתחילת השבוע והשלם אותו עד סוף השבוע. שתף עם המנחה את היעד וההישג.',
      reward: 50,
      active: true,
      category: 'יעדים',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      title: 'השתתף בפגישת צוות',
      description: 'השתתף באופן פעיל בפגישת הצוות השבועית. הגע מוכן עם עדכון על מה שעשית.',
      reward: 10,
      active: true,
      category: 'צוות',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ];

  for (const task of tasks) {
    const ref = await db.collection('tasks').add(task);
    console.log('Task created:', ref.id, '-', task.title);
  }

  console.log('\nSeed complete!');
  console.log('Admin login: admin@meital.app / Admin123!');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
