import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

// 🔥 ROUTER (IMPORTANTE)
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// 🔥 FIREBASE (lo dejas igual)
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDXzbaUunyitJhRQ0sALg1lEZmW7Hc-5r0",
  authDomain: "bitacora-maquinaria.firebaseapp.com",
  projectId: "bitacora-maquinaria",
  storageBucket: "bitacora-maquinaria.firebasestorage.app",
  messagingSenderId: "657952512296",
  appId: "1:657952512296:web:d0ea8a966f34a68b9e981d"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // 🔥 ESTA LÍNEA SOLUCIONA TODO

    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideHttpClient()
  ]
};