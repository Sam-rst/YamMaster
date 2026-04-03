# Profil Joueur — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer un écran Profil joueur avec stats calculées, avatar sélectionnable, rang basé sur les victoires, et nouvel onglet dans la tab bar.

**Architecture:** Backend : nouveau feature `profile/` avec service Prisma (agrégation GamePlayer) + routes REST (GET stats, PUT avatar). Frontend : feature `profile/` avec écran principal, composants ProfileCard/StatsGrid/AvatarPicker, et 3e onglet tab bar. Rang calculé côté backend (placeholder pour futur MMR).

**Tech Stack:** TypeScript, Prisma/PostgreSQL, Express REST, React Native/Expo, Jest

---

## File Map

### Backend — Fichiers créés
- `backend/src/features/profile/services/profile.service.ts`
- `backend/src/features/profile/services/profile.service.test.ts`
- `backend/src/features/profile/routes/profile.routes.ts`
- `backend/src/features/profile/routes/profile.routes.test.ts`

### Backend — Fichiers modifiés
- `backend/prisma/schema.prisma` — Champ `avatar` sur User
- `backend/src/infrastructure/socket.setup.ts` — Enregistrer profileRouter

### Frontend — Fichiers créés
- `frontend/src/features/profile/services/profile.service.ts`
- `frontend/src/features/profile/services/profile.service.test.ts`
- `frontend/src/features/profile/components/stats-grid/stats-grid.component.tsx`
- `frontend/src/features/profile/components/stats-grid/stats-grid.component.test.tsx`
- `frontend/src/features/profile/components/avatar-picker/avatar-picker.component.tsx`
- `frontend/src/features/profile/components/avatar-picker/avatar-picker.component.test.tsx`
- `frontend/src/features/profile/screens/profile.screen.tsx`
- `frontend/src/features/profile/screens/profile.screen.test.tsx`

### Frontend — Fichiers modifiés
- `frontend/App.tsx` — 3e onglet Profil dans MainTabs

---

## Task 1 : Gitflow — Créer la branche feature

**Files:** Aucun

- [ ] **Step 1: Créer la branche depuis develop**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster
git checkout develop
git pull origin develop
git checkout -b feature/player-profile
```

---

## Task 2 : Schema Prisma — Champ avatar sur User

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] **Step 1: Ajouter le champ avatar**

Dans `backend/prisma/schema.prisma`, ajouter dans le modèle `User` après `updatedAt` :

```prisma
  avatar    String   @default("🎲")
```

- [ ] **Step 2: Générer le client Prisma**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/backend
npx prisma generate
npx prisma db push
```

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/ backend/src/generated/
git commit -m "feat: schema Prisma — champ avatar sur User (défaut 🎲)"
```

---

## Task 3 : Backend — ProfileService (TDD)

**Files:**
- Create: `backend/src/features/profile/services/profile.service.test.ts`
- Create: `backend/src/features/profile/services/profile.service.ts`

- [ ] **Step 1: RED — Écrire les tests**

Créer `backend/src/features/profile/services/profile.service.test.ts` :

```typescript
import ProfileService from './profile.service';

// Mock Prisma
const mockPrismaClient = {
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    gamePlayer: {
        findMany: jest.fn(),
    },
};

jest.mock('../../../infrastructure/database', () => ({
    getPrismaClient: () => mockPrismaClient,
}));

describe('ProfileService', () => {

    beforeEach(() => jest.clearAllMocks());

    describe('getProfileStats', () => {
        it('retourne les stats pour un utilisateur avec des parties', async () => {
            mockPrismaClient.user.findUnique.mockResolvedValue({
                id: 'u1',
                username: 'alice',
                avatar: '🎲',
                createdAt: new Date('2024-03-14'),
            });

            mockPrismaClient.gamePlayer.findMany.mockResolvedValue([
                { result: 'WIN', score: 3, game: { mode: 'ONLINE', createdAt: new Date('2024-03-15') }, difficulty: null },
                { result: 'WIN', score: 4, game: { mode: 'VS_BOT', createdAt: new Date('2024-03-16') }, difficulty: 'MEDIUM' },
                { result: 'LOSE', score: 1, game: { mode: 'ONLINE', createdAt: new Date('2024-03-17') }, difficulty: null },
                { result: 'WIN', score: 2, game: { mode: 'VS_BOT', createdAt: new Date('2024-03-18') }, difficulty: 'EASY' },
            ]);

            const stats = await ProfileService.getProfileStats('u1');

            expect(stats.username).toBe('alice');
            expect(stats.avatar).toBe('🎲');
            expect(stats.stats.totalGames).toBe(4);
            expect(stats.stats.wins).toBe(3);
            expect(stats.stats.losses).toBe(1);
            expect(stats.stats.draws).toBe(0);
            expect(stats.stats.winRate).toBe(75);
            expect(stats.stats.onlineGames).toBe(2);
            expect(stats.stats.botGames).toBe(2);
        });

        it('calcule le rang Bronze pour 3 victoires', async () => {
            mockPrismaClient.user.findUnique.mockResolvedValue({
                id: 'u1', username: 'bob', avatar: '👑', createdAt: new Date(),
            });
            mockPrismaClient.gamePlayer.findMany.mockResolvedValue([
                { result: 'WIN', score: 2, game: { mode: 'ONLINE', createdAt: new Date() }, difficulty: null },
                { result: 'WIN', score: 1, game: { mode: 'ONLINE', createdAt: new Date() }, difficulty: null },
                { result: 'WIN', score: 3, game: { mode: 'ONLINE', createdAt: new Date() }, difficulty: null },
            ]);

            const stats = await ProfileService.getProfileStats('u1');
            expect(stats.rank.name).toBe('Bronze');
        });

        it('calcule le rang Or pour 20 victoires', async () => {
            mockPrismaClient.user.findUnique.mockResolvedValue({
                id: 'u1', username: 'pro', avatar: '🔥', createdAt: new Date(),
            });
            const wins = Array.from({ length: 20 }, (_, i) => ({
                result: 'WIN', score: 2, game: { mode: 'ONLINE', createdAt: new Date(Date.now() + i) }, difficulty: null,
            }));
            mockPrismaClient.gamePlayer.findMany.mockResolvedValue(wins);

            const stats = await ProfileService.getProfileStats('u1');
            expect(stats.rank.name).toBe('Or');
        });

        it('calcule le meilleur win streak', async () => {
            mockPrismaClient.user.findUnique.mockResolvedValue({
                id: 'u1', username: 'streak', avatar: '🎲', createdAt: new Date(),
            });
            mockPrismaClient.gamePlayer.findMany.mockResolvedValue([
                { result: 'WIN', score: 1, game: { mode: 'ONLINE', createdAt: new Date(1000) }, difficulty: null },
                { result: 'WIN', score: 2, game: { mode: 'ONLINE', createdAt: new Date(2000) }, difficulty: null },
                { result: 'WIN', score: 1, game: { mode: 'ONLINE', createdAt: new Date(3000) }, difficulty: null },
                { result: 'LOSE', score: 0, game: { mode: 'ONLINE', createdAt: new Date(4000) }, difficulty: null },
                { result: 'WIN', score: 3, game: { mode: 'ONLINE', createdAt: new Date(5000) }, difficulty: null },
            ]);

            const stats = await ProfileService.getProfileStats('u1');
            expect(stats.stats.bestWinStreak).toBe(3);
        });

        it('retourne null si utilisateur introuvable', async () => {
            mockPrismaClient.user.findUnique.mockResolvedValue(null);

            const stats = await ProfileService.getProfileStats('unknown');
            expect(stats).toBeNull();
        });
    });

    describe('updateAvatar', () => {
        it('met à jour l\'avatar avec un emoji valide', async () => {
            mockPrismaClient.user.update.mockResolvedValue({ avatar: '👑' });

            await ProfileService.updateAvatar('u1', '👑');
            expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
                where: { id: 'u1' },
                data: { avatar: '👑' },
            });
        });

        it('rejette un avatar invalide', async () => {
            await expect(ProfileService.updateAvatar('u1', 'invalid'))
                .rejects.toThrow('Avatar invalide');
        });
    });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/backend
npx jest src/features/profile/services/profile.service.test.ts --no-coverage
```

Expected: FAIL — Cannot find module

- [ ] **Step 3: GREEN — Implémenter le service**

Créer `backend/src/features/profile/services/profile.service.ts` :

```typescript
import { getPrismaClient } from '../../../infrastructure/database';
import { logger } from '../../../shared/logger';

const VALID_AVATARS = ['🎲', '👑', '🎯', '⚡', '🔥', '🏆', '💎', '🐉'];

interface RankInfo {
    name: string;
    tier: string;
    color: string;
}

interface ProfileStats {
    userId: string;
    username: string;
    avatar: string;
    createdAt: string;
    rank: RankInfo;
    stats: {
        totalGames: number;
        wins: number;
        losses: number;
        draws: number;
        winRate: number;
        onlineGames: number;
        botGames: number;
        bestWinStreak: number;
        averageScore: number;
        favoriteBotDifficulty: string | null;
    };
}

interface GamePlayerRecord {
    result: string;
    score: number;
    difficulty?: string | null;
    game: { mode: string; createdAt: Date };
}

const RANK_THRESHOLDS = [
    { name: 'Bronze', minWins: 0, maxWins: 4, color: '#cd7f32', tiers: 5 },
    { name: 'Argent', minWins: 5, maxWins: 14, color: '#c0c0c0', tiers: 10 },
    { name: 'Or', minWins: 15, maxWins: 29, color: '#f4d35e', tiers: 15 },
    { name: 'Diamant', minWins: 30, maxWins: 49, color: '#00d2ff', tiers: 20 },
    { name: 'Maître', minWins: 50, maxWins: Infinity, color: '#e94560', tiers: 1 },
];

const calculateRank = (wins: number): RankInfo => {
    for (const rank of RANK_THRESHOLDS) {
        if (wins >= rank.minWins && wins <= rank.maxWins) {
            if (rank.name === 'Maître') {
                return { name: rank.name, tier: '', color: rank.color };
            }
            const range = rank.maxWins - rank.minWins + 1;
            const position = wins - rank.minWins;
            const tierNumber = Math.min(Math.floor((position / range) * 4) + 1, 4);
            const tierLabels = ['I', 'II', 'III', 'IV'];
            return { name: rank.name, tier: tierLabels[tierNumber - 1], color: rank.color };
        }
    }
    return { name: 'Bronze', tier: 'I', color: '#cd7f32' };
};

const calculateBestWinStreak = (records: GamePlayerRecord[]): number => {
    const sorted = [...records].sort(
        (a, b) => new Date(a.game.createdAt).getTime() - new Date(b.game.createdAt).getTime()
    );

    let best = 0;
    let current = 0;
    for (const record of sorted) {
        if (record.result === 'WIN') {
            current++;
            if (current > best) best = current;
        } else {
            current = 0;
        }
    }
    return best;
};

const calculateFavoriteBotDifficulty = (records: GamePlayerRecord[]): string | null => {
    const botRecords = records.filter(r => r.game.mode === 'VS_BOT' && r.difficulty);
    if (botRecords.length === 0) return null;

    const counts: Record<string, number> = {};
    for (const r of botRecords) {
        const diff = r.difficulty as string;
        counts[diff] = (counts[diff] || 0) + 1;
    }

    let best: string | null = null;
    let bestCount = 0;
    for (const [diff, count] of Object.entries(counts)) {
        if (count > bestCount) {
            bestCount = count;
            best = diff;
        }
    }
    return best;
};

const ProfileService = {
    getProfileStats: async (userId: string): Promise<ProfileStats | null> => {
        try {
            const prisma = getPrismaClient();

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, username: true, avatar: true, createdAt: true },
            });

            if (!user) return null;

            const gameRecords = await prisma.gamePlayer.findMany({
                where: { userId, result: { not: 'PENDING' } },
                select: {
                    result: true,
                    score: true,
                    difficulty: true,
                    game: { select: { mode: true, createdAt: true } },
                },
                orderBy: { game: { createdAt: 'asc' } },
            }) as unknown as GamePlayerRecord[];

            const wins = gameRecords.filter(r => r.result === 'WIN').length;
            const losses = gameRecords.filter(r => r.result === 'LOSE').length;
            const draws = gameRecords.filter(r => r.result === 'DRAW').length;
            const totalGames = gameRecords.length;
            const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
            const onlineGames = gameRecords.filter(r => r.game.mode === 'ONLINE').length;
            const botGames = gameRecords.filter(r => r.game.mode === 'VS_BOT').length;
            const totalScore = gameRecords.reduce((sum, r) => sum + r.score, 0);
            const averageScore = totalGames > 0 ? Math.round((totalScore / totalGames) * 10) / 10 : 0;

            return {
                userId: user.id,
                username: user.username,
                avatar: user.avatar,
                createdAt: user.createdAt.toISOString(),
                rank: calculateRank(wins),
                stats: {
                    totalGames,
                    wins,
                    losses,
                    draws,
                    winRate,
                    onlineGames,
                    botGames,
                    bestWinStreak: calculateBestWinStreak(gameRecords),
                    averageScore,
                    favoriteBotDifficulty: calculateFavoriteBotDifficulty(gameRecords),
                },
            };
        } catch (error) {
            logger.error('Erreur lors du calcul des stats profil', { userId, error: error as Error });
            throw error;
        }
    },

    updateAvatar: async (userId: string, avatar: string): Promise<void> => {
        if (!VALID_AVATARS.includes(avatar)) {
            throw new Error('Avatar invalide');
        }

        try {
            const prisma = getPrismaClient();
            await prisma.user.update({
                where: { id: userId },
                data: { avatar },
            });
            logger.info('Avatar mis à jour', { userId, action: avatar });
        } catch (error) {
            logger.error('Erreur lors de la mise à jour de l\'avatar', { userId, error: error as Error });
            throw error;
        }
    },
};

export default ProfileService;
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/backend
npx jest src/features/profile/services/profile.service.test.ts --no-coverage
```

Expected: 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/features/profile/services/
git commit -m "feat: ProfileService — stats, rang, win streak, avatar (TDD)"
```

---

## Task 4 : Backend — Routes REST profil (TDD)

**Files:**
- Create: `backend/src/features/profile/routes/profile.routes.test.ts`
- Create: `backend/src/features/profile/routes/profile.routes.ts`
- Modify: `backend/src/infrastructure/socket.setup.ts`

- [ ] **Step 1: RED — Écrire les tests**

Créer `backend/src/features/profile/routes/profile.routes.test.ts` :

```typescript
import express from 'express';
import request from 'supertest';
import { profileRouter } from './profile.routes';

const mockGetProfileStats = jest.fn();
const mockUpdateAvatar = jest.fn();

jest.mock('../services/profile.service', () => ({
    __esModule: true,
    default: {
        getProfileStats: (...args: unknown[]) => mockGetProfileStats(...args),
        updateAvatar: (...args: unknown[]) => mockUpdateAvatar(...args),
    },
}));

const app = express();
app.use(express.json());
app.use('/profile', profileRouter);

describe('Profile Routes', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('GET /profile/:userId', () => {
        it('retourne les stats du profil', async () => {
            mockGetProfileStats.mockResolvedValue({
                userId: 'u1',
                username: 'alice',
                avatar: '🎲',
                rank: { name: 'Or', tier: 'III', color: '#f4d35e' },
                stats: { totalGames: 10, wins: 7, losses: 3, draws: 0, winRate: 70 },
            });

            const res = await request(app).get('/profile/u1');
            expect(res.status).toBe(200);
            expect(res.body.username).toBe('alice');
            expect(res.body.rank.name).toBe('Or');
        });

        it('retourne 404 si utilisateur introuvable', async () => {
            mockGetProfileStats.mockResolvedValue(null);

            const res = await request(app).get('/profile/unknown');
            expect(res.status).toBe(404);
        });
    });

    describe('PUT /profile/:userId/avatar', () => {
        it('met à jour l\'avatar', async () => {
            mockUpdateAvatar.mockResolvedValue(undefined);

            const res = await request(app)
                .put('/profile/u1/avatar')
                .send({ avatar: '👑' });

            expect(res.status).toBe(200);
            expect(mockUpdateAvatar).toHaveBeenCalledWith('u1', '👑');
        });

        it('retourne 400 si avatar manquant', async () => {
            const res = await request(app)
                .put('/profile/u1/avatar')
                .send({});

            expect(res.status).toBe(400);
        });
    });
});
```

- [ ] **Step 2: GREEN — Implémenter les routes**

Créer `backend/src/features/profile/routes/profile.routes.ts` :

```typescript
import { Router, Request, Response } from 'express';
import ProfileService from '../services/profile.service';
import { logger } from '../../../shared/logger';

export const profileRouter = Router();

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_SERVER_ERROR = 500;

profileRouter.get('/:userId', async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
    const userId = req.params.userId;

    try {
        const stats = await ProfileService.getProfileStats(userId);

        if (!stats) {
            res.status(HTTP_NOT_FOUND).json({ error: 'Utilisateur non trouvé' });
            return;
        }

        res.status(HTTP_OK).json(stats);
    } catch (error) {
        logger.error('Erreur sur GET /profile/:userId', { error: error as Error });
        res.status(HTTP_SERVER_ERROR).json({ error: 'Erreur serveur' });
    }
});

profileRouter.put('/:userId/avatar', async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
    const userId = req.params.userId;
    const { avatar } = req.body;

    if (!avatar) {
        res.status(HTTP_BAD_REQUEST).json({ error: 'Avatar requis' });
        return;
    }

    try {
        await ProfileService.updateAvatar(userId, avatar);
        res.status(HTTP_OK).json({ success: true });
    } catch (error) {
        const message = (error as Error).message;
        if (message === 'Avatar invalide') {
            res.status(HTTP_BAD_REQUEST).json({ error: message });
            return;
        }
        logger.error('Erreur sur PUT /profile/:userId/avatar', { error: error as Error });
        res.status(HTTP_SERVER_ERROR).json({ error: 'Erreur serveur' });
    }
});
```

- [ ] **Step 3: Enregistrer le router dans socket.setup.ts**

Dans `backend/src/infrastructure/socket.setup.ts` :

1. Ajouter l'import :
```typescript
import { profileRouter } from '../features/profile/routes/profile.routes';
```

2. Ajouter après `app.use('/api/history', historyRouter);` :
```typescript
app.use('/api/profile', profileRouter);
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/backend
npx jest src/features/profile/routes/profile.routes.test.ts --no-coverage
```

Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/features/profile/routes/ backend/src/infrastructure/socket.setup.ts
git commit -m "feat: routes REST profil — GET stats + PUT avatar (TDD)"
```

---

## Task 5 : Frontend — ProfileService (TDD)

**Files:**
- Create: `frontend/src/features/profile/services/profile.service.test.ts`
- Create: `frontend/src/features/profile/services/profile.service.ts`

- [ ] **Step 1: RED — Écrire les tests**

Créer `frontend/src/features/profile/services/profile.service.test.ts` :

```typescript
import ProfileService from './profile.service';

global.fetch = jest.fn();

describe('ProfileService', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('getProfile', () => {
        it('retourne les stats du profil', async () => {
            const mockData = {
                userId: 'u1',
                username: 'alice',
                avatar: '🎲',
                rank: { name: 'Or', tier: 'III', color: '#f4d35e' },
                stats: { totalGames: 10, wins: 7 },
            };

            (fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockData),
            });

            const result = await ProfileService.getProfile('u1');
            expect(result).toEqual(mockData);
        });

        it('retourne null en cas d\'erreur', async () => {
            (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

            const result = await ProfileService.getProfile('u1');
            expect(result).toBeNull();
        });
    });

    describe('updateAvatar', () => {
        it('appelle PUT avec le bon avatar', async () => {
            (fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            });

            await ProfileService.updateAvatar('u1', '👑');

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/profile/u1/avatar'),
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify({ avatar: '👑' }),
                }),
            );
        });
    });
});
```

- [ ] **Step 2: GREEN — Implémenter le service**

Créer `frontend/src/features/profile/services/profile.service.ts` :

```typescript
import { SERVER_URL } from '@/shared/services/config';

const PROFILE_API_URL = `${SERVER_URL}/api/profile`;

export interface RankInfo {
    name: string;
    tier: string;
    color: string;
}

export interface ProfileStats {
    userId: string;
    username: string;
    avatar: string;
    createdAt: string;
    rank: RankInfo;
    stats: {
        totalGames: number;
        wins: number;
        losses: number;
        draws: number;
        winRate: number;
        onlineGames: number;
        botGames: number;
        bestWinStreak: number;
        averageScore: number;
        favoriteBotDifficulty: string | null;
    };
}

const ProfileService = {
    getProfile: async (userId: string): Promise<ProfileStats | null> => {
        try {
            const response = await fetch(`${PROFILE_API_URL}/${userId}`);
            if (!response.ok) return null;
            return await response.json();
        } catch {
            return null;
        }
    },

    updateAvatar: async (userId: string, avatar: string): Promise<void> => {
        await fetch(`${PROFILE_API_URL}/${userId}/avatar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatar }),
        });
    },
};

export default ProfileService;
```

- [ ] **Step 3: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/profile/services/profile.service.test.ts --no-coverage
```

Expected: 3 tests PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/profile/services/
git commit -m "feat: ProfileService frontend — getProfile + updateAvatar (TDD)"
```

---

## Task 6 : Frontend — StatsGrid composant (TDD)

**Files:**
- Create: `frontend/src/features/profile/components/stats-grid/stats-grid.component.test.tsx`
- Create: `frontend/src/features/profile/components/stats-grid/stats-grid.component.tsx`

- [ ] **Step 1: RED — Écrire les tests**

Créer `frontend/src/features/profile/components/stats-grid/stats-grid.component.test.tsx` :

```tsx
import React from 'react';
import { render } from '@testing-library/react';
import StatsGrid from './stats-grid.component';

describe('StatsGrid', () => {
    const defaultStats = {
        totalGames: 47,
        wins: 30,
        losses: 17,
        draws: 0,
        winRate: 64,
        onlineGames: 22,
        botGames: 25,
        bestWinStreak: 5,
        averageScore: 3.2,
        favoriteBotDifficulty: 'MEDIUM' as const,
    };

    test('affiche les 4 stats principales', () => {
        const { getByText } = render(<StatsGrid stats={defaultStats} />);
        expect(getByText('47')).toBeTruthy();
        expect(getByText('64%')).toBeTruthy();
        expect(getByText('30')).toBeTruthy();
        expect(getByText('17')).toBeTruthy();
    });

    test('affiche les stats par mode', () => {
        const { getByText } = render(<StatsGrid stats={defaultStats} />);
        expect(getByText('22')).toBeTruthy();
        expect(getByText('25')).toBeTruthy();
        expect(getByText('5')).toBeTruthy();
    });

    test('affiche les stats avancées', () => {
        const { getByText } = render(<StatsGrid stats={defaultStats} />);
        expect(getByText('3.2')).toBeTruthy();
    });
});
```

- [ ] **Step 2: GREEN — Implémenter le composant**

Créer `frontend/src/features/profile/components/stats-grid/stats-grid.component.tsx` :

```tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '@/shared/theme/colors';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const DIFFICULTY_LABELS: Record<string, string> = {
    EASY: 'Débutant',
    MEDIUM: 'Tactique',
    HARD: 'Maître IA',
};

interface Stats {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    onlineGames: number;
    botGames: number;
    bestWinStreak: number;
    averageScore: number;
    favoriteBotDifficulty: string | null;
}

interface StatsGridProps {
    stats: Stats;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                <View style={styles.cell}>
                    <Text style={styles.cellValue}>{stats.totalGames}</Text>
                    <Text style={styles.cellLabel}>Parties</Text>
                </View>
                <View style={styles.cell}>
                    <Text style={[styles.cellValue, { color: colors.success }]}>{`${stats.winRate}%`}</Text>
                    <Text style={styles.cellLabel}>Ratio V/D</Text>
                </View>
                <View style={styles.cell}>
                    <Text style={[styles.cellValue, { color: colors.primary }]}>{stats.wins}</Text>
                    <Text style={styles.cellLabel}>Victoires</Text>
                </View>
                <View style={styles.cell}>
                    <Text style={[styles.cellValue, { color: 'rgba(255,255,255,0.6)' }]}>{stats.losses}</Text>
                    <Text style={styles.cellLabel}>Défaites</Text>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Par mode</Text>
            </View>
            <View style={styles.modeRow}>
                <View style={styles.modeCell}>
                    <Text style={styles.modeEmoji}>🌐</Text>
                    <Text style={[styles.modeValue, { color: colors.blue }]}>{stats.onlineGames}</Text>
                    <Text style={styles.modeLabel}>En ligne</Text>
                </View>
                <View style={styles.modeCell}>
                    <Text style={styles.modeEmoji}>🤖</Text>
                    <Text style={[styles.modeValue, { color: colors.gold }]}>{stats.botGames}</Text>
                    <Text style={styles.modeLabel}>Vs Bot</Text>
                </View>
                <View style={styles.modeCell}>
                    <Text style={styles.modeEmoji}>🔥</Text>
                    <Text style={[styles.modeValue, { color: colors.primary }]}>{stats.bestWinStreak}</Text>
                    <Text style={styles.modeLabel}>Win streak</Text>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <View style={[styles.sectionAccent, { backgroundColor: colors.blue }]} />
                <Text style={styles.sectionTitle}>Avancé</Text>
            </View>
            <View style={styles.advancedCard}>
                <View style={styles.advancedRow}>
                    <Text style={styles.advancedLabel}>Score moyen</Text>
                    <Text style={styles.advancedValue}>{stats.averageScore}</Text>
                </View>
                <View style={styles.advancedRow}>
                    <Text style={styles.advancedLabel}>Nuls</Text>
                    <Text style={styles.advancedValue}>{stats.draws}</Text>
                </View>
                <View style={styles.advancedRow}>
                    <Text style={styles.advancedLabel}>Bot préféré</Text>
                    <Text style={[styles.advancedValue, { color: colors.gold }]}>
                        {stats.favoriteBotDifficulty ? DIFFICULTY_LABELS[stats.favoriteBotDifficulty] ?? stats.favoriteBotDifficulty : '—'}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default StatsGrid;

const styles = StyleSheet.create({
    container: { gap: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    cell: {
        width: '48%',
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
    },
    cellValue: { fontFamily: fontDisplay, fontSize: 24, fontWeight: '900', color: colors.textPrimary },
    cellLabel: { fontFamily: fontSans, fontSize: 10, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 2 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sectionAccent: { width: 20, height: 2, backgroundColor: colors.primary },
    sectionTitle: { fontFamily: fontSans, fontSize: 10, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 2 },
    modeRow: { flexDirection: 'row', gap: 8 },
    modeCell: {
        flex: 1,
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    modeEmoji: { fontSize: 14, marginBottom: 4 },
    modeValue: { fontFamily: fontDisplay, fontSize: 16, fontWeight: '900' },
    modeLabel: { fontFamily: fontSans, fontSize: 9, color: colors.textSecondary, textTransform: 'uppercase' },
    advancedCard: {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 14,
        gap: 10,
    },
    advancedRow: { flexDirection: 'row', justifyContent: 'space-between' },
    advancedLabel: { fontFamily: fontSans, fontSize: 12, color: colors.textSecondary },
    advancedValue: { fontFamily: fontSans, fontSize: 12, fontWeight: '700', color: colors.textPrimary },
});
```

- [ ] **Step 3: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/profile/components/stats-grid/stats-grid.component.test.tsx --no-coverage
```

Expected: 3 tests PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/profile/components/stats-grid/
git commit -m "feat: composant StatsGrid — stats globales, par mode, avancées (TDD)"
```

---

## Task 7 : Frontend — AvatarPicker composant (TDD)

**Files:**
- Create: `frontend/src/features/profile/components/avatar-picker/avatar-picker.component.test.tsx`
- Create: `frontend/src/features/profile/components/avatar-picker/avatar-picker.component.tsx`

- [ ] **Step 1: RED — Écrire les tests**

Créer `frontend/src/features/profile/components/avatar-picker/avatar-picker.component.test.tsx` :

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import AvatarPicker from './avatar-picker.component';

describe('AvatarPicker', () => {
    const mockSelect = jest.fn();
    const mockClose = jest.fn();

    beforeEach(() => jest.clearAllMocks());

    test('affiche les 8 avatars', () => {
        const { getByText } = render(
            <AvatarPicker visible={true} currentAvatar="🎲" onSelect={mockSelect} onClose={mockClose} />
        );
        expect(getByText('🎲')).toBeTruthy();
        expect(getByText('👑')).toBeTruthy();
        expect(getByText('🐉')).toBeTruthy();
    });

    test('appelle onSelect au clic sur un avatar', () => {
        const { getByText } = render(
            <AvatarPicker visible={true} currentAvatar="🎲" onSelect={mockSelect} onClose={mockClose} />
        );
        fireEvent.click(getByText('👑'));
        expect(mockSelect).toHaveBeenCalledWith('👑');
    });

    test('appelle onClose au clic sur fermer', () => {
        const { getByTestId } = render(
            <AvatarPicker visible={true} currentAvatar="🎲" onSelect={mockSelect} onClose={mockClose} />
        );
        fireEvent.click(getByTestId('icon-x'));
        expect(mockClose).toHaveBeenCalledTimes(1);
    });
});
```

- [ ] **Step 2: GREEN — Implémenter le composant**

Créer `frontend/src/features/profile/components/avatar-picker/avatar-picker.component.tsx` :

```tsx
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });

const AVATARS = ['🎲', '👑', '🎯', '⚡', '🔥', '🏆', '💎', '🐉'];

interface AvatarPickerProps {
    visible: boolean;
    currentAvatar: string;
    onSelect: (avatar: string) => void;
    onClose: () => void;
}

const AvatarPicker: React.FC<AvatarPickerProps> = ({ visible, currentAvatar, onSelect, onClose }) => {
    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Choisir un avatar</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Feather name="x" size={20} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.grid}>
                        {AVATARS.map((avatar) => (
                            <TouchableOpacity
                                key={avatar}
                                style={[styles.avatarButton, avatar === currentAvatar && styles.avatarSelected]}
                                onPress={() => onSelect(avatar)}
                            >
                                <Text style={styles.avatarEmoji}>{avatar}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default AvatarPicker;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: colors.background,
        borderRadius: 20,
        padding: 24,
        width: '85%',
        maxWidth: 350,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontFamily: fontDisplay,
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.glass,
        justifyContent: 'center',
        alignItems: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    avatarButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.glass,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarSelected: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(233, 69, 96, 0.1)',
    },
    avatarEmoji: {
        fontSize: 28,
    },
});
```

- [ ] **Step 3: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/profile/components/avatar-picker/avatar-picker.component.test.tsx --no-coverage
```

Expected: 3 tests PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/profile/components/avatar-picker/
git commit -m "feat: composant AvatarPicker — sélection parmi 8 emojis (TDD)"
```

---

## Task 8 : Frontend — ProfileScreen (TDD)

**Files:**
- Create: `frontend/src/features/profile/screens/profile.screen.test.tsx`
- Create: `frontend/src/features/profile/screens/profile.screen.tsx`

- [ ] **Step 1: RED — Écrire les tests**

Créer `frontend/src/features/profile/screens/profile.screen.test.tsx` :

```tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import ProfileScreen from './profile.screen';

const mockGetProfile = jest.fn();
const mockUpdateAvatar = jest.fn();

jest.mock('../services/profile.service', () => ({
    __esModule: true,
    default: {
        getProfile: (...args: unknown[]) => mockGetProfile(...args),
        updateAvatar: (...args: unknown[]) => mockUpdateAvatar(...args),
    },
}));

jest.mock('@/shared/contexts/auth.context', () => ({
    useAuth: () => ({
        user: { id: 'u1', username: 'alice', createdAt: '2024-03-14T00:00:00.000Z' },
        isAuthenticated: true,
    }),
}));

const mockProfile = {
    userId: 'u1',
    username: 'alice',
    avatar: '🎲',
    createdAt: '2024-03-14T00:00:00.000Z',
    rank: { name: 'Or', tier: 'III', color: '#f4d35e' },
    stats: {
        totalGames: 47,
        wins: 30,
        losses: 17,
        draws: 0,
        winRate: 64,
        onlineGames: 22,
        botGames: 25,
        bestWinStreak: 5,
        averageScore: 3.2,
        favoriteBotDifficulty: 'MEDIUM',
    },
};

describe('ProfileScreen', () => {
    beforeEach(() => jest.clearAllMocks());

    test('affiche le loader puis les données', async () => {
        mockGetProfile.mockResolvedValue(mockProfile);

        const { getByText } = render(<ProfileScreen />);

        await waitFor(() => {
            expect(getByText('alice')).toBeTruthy();
        });

        expect(getByText('🎲')).toBeTruthy();
        expect(getByText(/Or/)).toBeTruthy();
    });

    test('affiche les stats', async () => {
        mockGetProfile.mockResolvedValue(mockProfile);

        const { getByText } = render(<ProfileScreen />);

        await waitFor(() => {
            expect(getByText('47')).toBeTruthy();
            expect(getByText('64%')).toBeTruthy();
        });
    });

    test('affiche un message si profil introuvable', async () => {
        mockGetProfile.mockResolvedValue(null);

        const { getByText } = render(<ProfileScreen />);

        await waitFor(() => {
            expect(getByText(/introuvable/i)).toBeTruthy();
        });
    });
});
```

- [ ] **Step 2: GREEN — Implémenter l'écran**

Créer `frontend/src/features/profile/screens/profile.screen.tsx` :

```tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useAuth } from '@/shared/contexts/auth.context';
import ProfileService, { ProfileStats } from '../services/profile.service';
import StatsGrid from '../components/stats-grid/stats-grid.component';
import AvatarPicker from '../components/avatar-picker/avatar-picker.component';
import { colors } from '@/shared/theme/colors';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const ProfileScreen: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<ProfileStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);

    const loadProfile = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const data = await ProfileService.getProfile(user.id);
        setProfile(data);
        setLoading(false);
    }, [user?.id]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleAvatarSelect = async (avatar: string) => {
        if (!user?.id) return;
        await ProfileService.updateAvatar(user.id, avatar);
        setProfile(prev => prev ? { ...prev, avatar } : null);
        setAvatarPickerVisible(false);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Profil introuvable</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
            <View style={styles.profileCard}>
                <TouchableOpacity
                    style={styles.avatarContainer}
                    onPress={() => setAvatarPickerVisible(true)}
                >
                    <Text style={styles.avatarEmoji}>{profile.avatar}</Text>
                </TouchableOpacity>
                <Text style={styles.username}>{profile.username}</Text>
                <Text style={styles.memberSince}>
                    {`Membre depuis ${new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`}
                </Text>
                <View style={[styles.rankBadge, { borderColor: profile.rank.color }]}>
                    <Text style={[styles.rankText, { color: profile.rank.color }]}>
                        {`⭐ ${profile.rank.name}${profile.rank.tier ? ` ${profile.rank.tier}` : ''}`}
                    </Text>
                </View>
            </View>

            <StatsGrid stats={profile.stats} />

            <TouchableOpacity
                style={styles.changeAvatarButton}
                onPress={() => setAvatarPickerVisible(true)}
            >
                <Text style={styles.changeAvatarText}>✏️ Changer d'avatar</Text>
            </TouchableOpacity>

            <AvatarPicker
                visible={avatarPickerVisible}
                currentAvatar={profile.avatar}
                onSelect={handleAvatarSelect}
                onClose={() => setAvatarPickerVisible(false)}
            />
        </ScrollView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    scrollView: { flex: 1, backgroundColor: colors.background },
    container: { padding: 24, paddingTop: 48, paddingBottom: 40 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    errorText: { fontFamily: fontSans, fontSize: 14, color: colors.textSecondary },
    profileCard: { alignItems: 'center', marginBottom: 28 },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: colors.primary,
        backgroundColor: 'rgba(233,69,96,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarEmoji: { fontSize: 36 },
    username: {
        fontFamily: fontDisplay,
        fontSize: 20,
        fontWeight: '900',
        color: colors.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    memberSince: {
        fontFamily: fontSans,
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 4,
    },
    rankBadge: {
        marginTop: 8,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: 'rgba(244,211,94,0.1)',
    },
    rankText: {
        fontFamily: fontSans,
        fontSize: 12,
        fontWeight: '700',
    },
    changeAvatarButton: {
        alignSelf: 'center',
        marginTop: 20,
        padding: 12,
        backgroundColor: 'rgba(233,69,96,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(233,69,96,0.2)',
        borderRadius: 12,
    },
    changeAvatarText: {
        fontFamily: fontSans,
        fontSize: 11,
        color: colors.primary,
        fontWeight: '700',
    },
});
```

- [ ] **Step 3: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/profile/screens/profile.screen.test.tsx --no-coverage
```

Expected: 3 tests PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/profile/screens/
git commit -m "feat: écran ProfileScreen — profil complet avec stats et avatar (TDD)"
```

---

## Task 9 : Frontend — 3e onglet Profil dans la tab bar

**Files:**
- Modify: `frontend/App.tsx`

- [ ] **Step 1: Ajouter l'onglet Profil dans MainTabs**

Dans `frontend/App.tsx` :

1. Importer ProfileScreen :
```typescript
import ProfileScreen from '@/features/profile/screens/profile.screen';
```

2. Ajouter le 3e Tab.Screen dans MainTabs, après RulesTab :
```tsx
<Tab.Screen
    name="Profil"
    component={ProfileScreen}
    options={{
        tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
    }}
/>
```

- [ ] **Step 2: Lancer tous les tests frontend**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest --no-coverage
```

Expected: Tous PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/App.tsx
git commit -m "feat: onglet Profil dans la tab bar (3e onglet)"
```

---

## Task 10 : Tests globaux + lint + coverage

**Files:** Aucun nouveau

- [ ] **Step 1: Tests backend**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/backend
npm test -- --no-coverage
```

- [ ] **Step 2: Tests frontend**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npm test -- --no-coverage
```

- [ ] **Step 3: Lint**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/backend && npm run lint
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend && npm run lint
```

- [ ] **Step 4: Coverage**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/backend && npm run test:coverage
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend && npm run test:coverage
```

Expected: ≥ 90% des deux côtés

- [ ] **Step 5: Commit si corrections**

```bash
git add -A
git commit -m "fix: corrections tests et lint après intégration profil joueur"
```

---

## Task 11 : Merge dans develop

**Files:** Aucun

- [ ] **Step 1: Merge et push**

```bash
git checkout develop
git merge feature/player-profile --no-ff -m "merge: Intègre feature/player-profile dans develop"
git push origin develop
```
