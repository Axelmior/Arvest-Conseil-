# Arvest Pilot

Logiciel SaaS de pilotage financier pour dirigeants de TPE, PME, commerçants, artisans et indépendants.

## Stack technique

- **Vite** + **React 18** (JavaScript, pas TypeScript)
- **React Router v6** pour la navigation
- **Context API** pour l'authentification
- **Recharts** pour les graphiques
- **Lucide React** pour les icônes
- **CSS pur** (pas de Tailwind)

## Installation & démarrage

```bash
npm install
npm run dev
```

L'application démarre sur [http://localhost:5173](http://localhost:5173).

## Build production

```bash
npm run build     # Génère dist/
npm run preview   # Preview locale du build
```

## Déploiement Vercel

Le projet est prêt à déployer :

1. Pousser sur GitHub / GitLab
2. Importer sur [vercel.com](https://vercel.com) — Vercel détecte automatiquement Vite
3. Déployer

Le fichier `vercel.json` gère les rewrites pour que React Router fonctionne sur toutes les routes.

## Routes de l'application

### Publiques
- `/` — Landing page (présentation du logiciel)
- `/login` — Connexion
- `/signup` — Inscription

### Protégées (nécessitent l'authentification)
- `/dashboard` — Tableau de bord principal
- `/dashboard/sales` — Gestion des ventes
- `/dashboard/expenses` — Gestion des charges
- `/dashboard/treasury` — Trésorerie
- `/dashboard/analytics` — Analyses et alertes
- `/dashboard/settings` — Paramètres

## Connexion démo

Sur `/login`, les champs sont pré-remplis. Cliquer sur **Se connecter** accède directement au dashboard (authentification simulée via Context).

## Structure du projet

```
arvest-pilot/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── KPICard.jsx / .css
│   │   ├── Logo.jsx / .css
│   │   ├── ProtectedRoute.jsx
│   │   ├── Sidebar.jsx / .css
│   │   └── TopBar.jsx / .css
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── data/
│   │   └── mockData.js
│   ├── pages/
│   │   ├── Analytics.jsx
│   │   ├── AuthPages.css
│   │   ├── Dashboard.jsx
│   │   ├── DashboardLayout.jsx / .css
│   │   ├── Expenses.jsx
│   │   ├── LandingPage.jsx / .css
│   │   ├── LoginPage.jsx
│   │   ├── NotFound.jsx
│   │   ├── Sales.jsx
│   │   ├── Settings.jsx
│   │   ├── SignupPage.jsx
│   │   └── Treasury.jsx
│   ├── styles/
│   │   └── global.css
│   ├── utils/
│   │   └── format.js
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
├── README.md
├── vercel.json
└── vite.config.js
```

## Architecture clé

- **`main.jsx`** : point d'entrée, wrappe `<App/>` dans `<BrowserRouter>` et `<AuthProvider>`
- **`App.jsx`** : déclare toutes les routes avec `<Routes>`
- **`ProtectedRoute`** : garde qui redirige vers `/login` si non authentifié, avec gestion du loading pour éviter tout flash d'écran blanc
- **`AuthContext`** : fournit `user`, `isAuthenticated`, `login`, `signup`, `logout`. Persistance en `sessionStorage` avec try/catch pour éviter tout crash
- **`DashboardLayout`** : layout commun pour toutes les pages du dashboard (sidebar + topbar + `<Outlet/>`)

## Pour brancher un backend réel

Remplacer les fonctions `login`, `signup`, `logout` dans `src/context/AuthContext.jsx` par des appels API (Supabase, Firebase, ou API Node custom). Le reste du code ne nécessite aucun changement.

## Licence

© 2026 Arvest Pilot
