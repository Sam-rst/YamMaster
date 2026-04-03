# Profil Joueur — Spec de design

## Objectif

Créer un écran Profil joueur avec stats calculées depuis la BDD, avatar sélectionnable, rang basé sur les victoires, et nouvel onglet dans la bottom tab bar.

## Base de données

### Modification du schéma Prisma

Ajouter un champ `avatar` sur le modèle `User` :

```prisma
model User {
  // ... champs existants
  avatar String @default("🎲")  // Emoji avatar sélectionné
}
```

Migration Prisma standard. Les users existants auront `avatar: "🎲"` par défaut.

### Avatars disponibles

8 emojis prédéfinis : 🎲 👑 🎯 ⚡ 🔥 🏆 💎 🐉

Liste hardcodée côté frontend (pas de table BDD). Extensible plus tard avec le système XP.

## Backend — Feature profile

### Structure

```
backend/src/features/profile/
├── services/
│   └── profile.service.ts       # Calcul des stats depuis GamePlayer
│   └── profile.service.test.ts
├── routes/
│   └── profile.routes.ts        # GET /api/profile/:userId, PUT /api/profile/:userId/avatar
```

### API REST

#### GET /api/profile/:userId

Retourne les stats calculées :

```typescript
interface ProfileStats {
    userId: string;
    username: string;
    avatar: string;
    createdAt: string;
    rank: { name: string; tier: string; color: string };
    stats: {
        totalGames: number;
        wins: number;
        losses: number;
        draws: number;
        winRate: number;          // pourcentage (0-100)
        onlineGames: number;
        botGames: number;
        bestWinStreak: number;
        averageScore: number;
        favoriteBotDifficulty: string | null;  // 'EASY' | 'MEDIUM' | 'HARD' | null
    };
}
```

#### PUT /api/profile/:userId/avatar

Body : `{ avatar: string }`

Valide que l'avatar est dans la liste autorisée. Met à jour le champ `avatar` sur User.

### ProfileService

Méthodes :

- `getProfileStats(userId: string): Promise<ProfileStats>` — Agrège les données depuis GamePlayer
- `updateAvatar(userId: string, avatar: string): Promise<void>` — Met à jour l'avatar

### Calcul des stats

Toutes les stats sont calculées dynamiquement depuis `GamePlayer` (pas de cache, pas de stockage redondant) :

```sql
-- Pseudo-requête
SELECT
  COUNT(*) as totalGames,
  SUM(CASE WHEN result = 'WIN' THEN 1 ELSE 0 END) as wins,
  SUM(CASE WHEN result = 'LOSE' THEN 1 ELSE 0 END) as losses,
  SUM(CASE WHEN result = 'DRAW' THEN 1 ELSE 0 END) as draws,
  AVG(score) as averageScore
FROM GamePlayer WHERE userId = :userId AND result != 'PENDING'
```

Pour le **win streak** : récupérer les parties triées par date, compter la plus longue série de WIN consécutives.

Pour la **difficulté bot préférée** : compter les parties VS_BOT groupées par difficulty, retourner la plus fréquente.

### Système de rangs

Basé sur le nombre de victoires total :

| Rang | Victoires | Couleur |
|------|-----------|---------|
| Bronze | 0 – 4 | `#cd7f32` |
| Argent | 5 – 14 | `#c0c0c0` |
| Or | 15 – 29 | `colors.gold` (#f4d35e) |
| Diamant | 30 – 49 | `colors.blue` (#00d2ff) |
| Maître | 50+ | `colors.primary` (#e94560) |

Sous-tiers (I à IV) calculés par progression dans la tranche : ex. 0-1 = Bronze I, 2 = Bronze II, 3 = Bronze III, 4 = Bronze IV.

Le rang est calculé côté backend dans `ProfileService`, pas stocké en BDD. Quand on implémentera le vrai MMR/Elo, on remplacera ce calcul.

## Frontend — Feature profile

### Structure Feature-Sliced

```
frontend/src/features/profile/
├── screens/
│   └── profile.screen.tsx
│   └── profile.screen.test.tsx
├── components/
│   └── profile-card/
│       └── profile-card.component.tsx
│       └── profile-card.component.test.tsx
│   └── stats-grid/
│       └── stats-grid.component.tsx
│       └── stats-grid.component.test.tsx
│   └── avatar-picker/
│       └── avatar-picker.component.tsx
│       └── avatar-picker.component.test.tsx
├── services/
│   └── profile.service.ts
│   └── profile.service.test.ts
```

### ProfileScreen

Écran principal, nouvel onglet dans la tab bar (icône Feather `user`).

Layout (ScrollView) :
1. **ProfileCard** — Avatar, username, date d'inscription, badge de rang
2. **StatsGrid** — Grille 2x2 (Parties, Ratio V/D, Victoires, Défaites)
3. **Section "Par mode"** — 3 colonnes (En ligne, Vs Bot, Win streak)
4. **Section "Avancé"** — Liste clé/valeur (Score moyen, Nuls, Bot préféré)
5. **Bouton "Changer d'avatar"** — Ouvre l'AvatarPicker en modal

Charge les données via `ProfileService.getProfile(userId)` au mount. Affiche un loader pendant le chargement.

### ProfileCard

Composant d'en-tête du profil :
- Avatar emoji dans un cercle bordé coral (80x80)
- Username en gros (Outfit, uppercase)
- "Membre depuis {date}" en petit
- Badge de rang : pill avec couleur du rang + nom (ex: "⭐ Or III")

### StatsGrid

Grille 2x2 de glass cards :
- Chaque carte : valeur en gros + label en petit uppercase
- Couleurs : victoires en coral, ratio en vert, défaites en gris atténué

### AvatarPicker

Modal avec grille d'emojis (4x2). Au clic sur un emoji :
1. Appel `ProfileService.updateAvatar(userId, emoji)`
2. Mise à jour locale
3. Fermeture de la modal

### ProfileService (frontend)

```typescript
const ProfileService = {
    getProfile: async (userId: string): Promise<ProfileStats> => { ... },
    updateAvatar: async (userId: string, avatar: string): Promise<void> => { ... },
};
```

Appels REST vers `/api/profile/:userId` et `/api/profile/:userId/avatar`.

## Navigation

### Tab bar mise à jour

| Icône | Label | Écran |
|-------|-------|-------|
| `home` | Accueil | HomeStackNavigator |
| `book-open` | Règles | RulesScreen |
| `user` | Profil | ProfileScreen |

3 onglets. L'onglet Profil est le dernier.

### Modification App.tsx

Ajouter le ProfileScreen comme 3e tab dans MainTabs.

### Mise à jour du Home Screen

Les stats placeholder du Home (rang, ratio V/D) seront connectées aux vraies données via le même endpoint `/api/profile/:userId`. Le Home affiche un résumé, le Profil affiche tout.

## Tests

### Backend
- **ProfileService** : tests unitaires pour getProfileStats (cas vide, cas avec données, calcul rang, win streak, bot préféré)
- **Profile routes** : tests d'intégration GET + PUT avatar (validation)

### Frontend
- **ProfileScreen** : affiche loader puis données, gestion erreur
- **ProfileCard** : affiche avatar, username, rang
- **StatsGrid** : affiche les 4 stats
- **AvatarPicker** : affiche les 8 emojis, sélection, callback
- **ProfileService** : mock des appels REST
