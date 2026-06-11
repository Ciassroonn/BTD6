import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth();

// Validate Connection to Firestore on startup
async function testConnection() {
  try {
    const isMock = firebaseConfig.apiKey === 'placeholder-api-key';
    if (isMock) {
      console.log('Firebase is currently running with local fallback placeholders.');
      return;
    }
    // Perform standard getDocFromServer verification
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Successfully validated secure Firebase connection.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    } else {
      console.warn('Firebase server connection test returned:', error);
    }
  }
}

testConnection();
