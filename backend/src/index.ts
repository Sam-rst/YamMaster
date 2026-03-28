// backend/src/index.ts — Point d'entrée du serveur

import 'dotenv/config';
import { Game } from './shared/types';
import { createServer, setupSocketHandlers } from './infrastructure/socket.setup';

const PORT = process.env.PORT || 3000;
const DEV_MODE = process.env.DEV_MODE === 'true';
const games: Game[] = [];

const { app, server, io } = createServer();

setupSocketHandlers(io, games);

app.get('/', (_req, res) => res.sendFile('index.html'));

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}` + (DEV_MODE ? ' [DEV MODE]' : ''));
});
