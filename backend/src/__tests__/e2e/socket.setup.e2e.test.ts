// backend/src/__tests__/e2e/socket.setup.e2e.test.ts
// Tests E2E : vrai serveur Socket.IO + vrais clients

import http from 'node:http';
import { Server } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { Game } from '../../shared/types';
import { createServer, setupSocketHandlers } from '../../infrastructure/socket.setup';

let server: http.Server;
let ioServer: Server;
let games: Game[];
const PORT = 4567;
const clients: ClientSocket[] = [];

const createClient = (): Promise<ClientSocket> => {
    return new Promise((resolve) => {
        const client = Client(`http://localhost:${PORT}`, {
            transports: ['websocket'],
            forceNew: true,
        });
        clients.push(client);
        client.on('connect', () => resolve(client));
    });
};

beforeAll((done) => {
    const { server: s, io } = createServer();
    server = s;
    ioServer = io;
    games = [];
    setupSocketHandlers(io, games);
    server.listen(PORT, done);
});

afterEach(() => {
    // Nettoyer tous les clients et les parties entre chaque test
    for (const client of clients) {
        if (client.connected) client.disconnect();
    }
    clients.length = 0;
    // Nettoyer les intervalles des parties restantes
    for (const game of games) {
        clearInterval(game.gameInterval);
    }
    games.length = 0;
});

afterAll((done) => {
    ioServer.close();
    server.close(done);
});

// ================================================================
// CONNECTION
// ================================================================

describe('E2E - Connection', () => {
    test('un client peut se connecter au serveur', async () => {
        const client = await createClient();
        expect(client.connected).toBe(true);
    });
});

// ================================================================
// VS BOT (testé avant queue pour éviter les conflits de queue)
// ================================================================

describe('E2E - VsBot', () => {
    test('un joueur peut lancer une partie VsBot et reçoit game.start', async () => {
        const client = await createClient();

        const result = await new Promise<unknown>((resolve) => {
            client.on('game.start', (data: unknown) => resolve(data));
            client.emit('game.vsbot');
        });

        expect(result).toBeDefined();
    });
});

// ================================================================
// GAME FLOW
// ================================================================

describe('E2E - Game Flow', () => {
    test('un joueur peut lancer les dés et recevoir les view-states', async () => {
        const client = await createClient();

        await new Promise<void>((resolve) => {
            client.on('game.start', () => resolve());
            client.emit('game.vsbot');
        });

        const deckState = await new Promise<unknown>((resolve) => {
            client.on('game.deck.view-state', (data: unknown) => resolve(data));
            client.emit('game.dices.roll');
        });

        expect(deckState).toBeDefined();
    });

    test('un joueur peut verrouiller un dé', async () => {
        const client = await createClient();

        await new Promise<void>((resolve) => {
            client.on('game.start', () => resolve());
            client.emit('game.vsbot');
        });

        // Premier lancer
        await new Promise<void>((resolve) => {
            client.on('game.deck.view-state', () => resolve());
            client.emit('game.dices.roll');
        });

        // Verrouiller le premier dé (id = 1)
        const deckAfterLock = await new Promise<unknown>((resolve) => {
            client.once('game.deck.view-state', (data: unknown) => resolve(data));
            client.emit('game.dices.lock', 1);
        });

        expect(deckAfterLock).toBeDefined();
    });
});
