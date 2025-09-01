// firebase.js
import { initializeApp, getApps } from 'firebase/app';
import config from './config';

const firebaseConfig = {
    apiKey: config.FIREBASE_API_KEY,
    authDomain: config.FIREBASE_authDomain,
    projectId: config.FIREBASE_projectId,
    storageBucket: config.FIREBASE_storageBucket,
    messagingSenderId: config.FIREBASE_messagingSenderId,
    appId: config.FIREBASE_appId,
    measurementId: config.FIREBASE_measurementId,
};

// Check if Firebase apps are already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export default app;
