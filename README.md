            # UCAO IIM-GTTIC - Student Communication Site (React + Firebase)

            ## Contenu
            Ce projet est un starter React connecté à Firebase (Authentication, Firestore, Storage).
            Il inclut: Accueil, Annonces, Ressources, Membres, Profil, Administration.

            ## Configuration Firebase
            1. Crée un projet sur https://console.firebase.google.com/
            2. Active Authentication (Email/Password), Firestore Database et Storage.
            3. Dans le fichier `.env.local` ou variables d'environnement, ajoute les clés :

               REACT_APP_FIREBASE_API_KEY=your_api_key
               REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
               REACT_APP_FIREBASE_PROJECT_ID=your_project_id
               REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
               REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
               REACT_APP_FIREBASE_APP_ID=your_app_id
               REACT_APP_ADMIN_UIDS=comma_separated_admin_uids

            ## Déploiement gratuit recommandé
            - Netlify (import GitHub repo) ou Vercel ou Firebase Hosting.
            - Ajoute les variables d'environnement dans Netlify/Vercel (REACT_APP_FIREBASE_*).

            ## Admin unique
            Après t'être inscrit, récupère ton UID Firebase (console auth) et ajoute-le dans la collection `admins` ou dans REACT_APP_ADMIN_UIDS.

            ## Structure principale
            - public/index.html
- src/App.js
- src/index.js

