// backend/src/shared/exceptions.ts
// Classes d'erreur custom typées pour le domaine métier

export class AppError extends Error {
    public readonly code: string;

    constructor(message: string, code = 'APP_ERROR') {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class GameNotFoundError extends AppError {
    constructor(socketId: string) {
        super(`Aucune partie trouvée pour le socket [${socketId}]`, 'GAME_NOT_FOUND');
    }
}

export class InvalidActionError extends AppError {
    constructor(action: string, reason: string) {
        super(`Action invalide [${action}] : ${reason}`, 'INVALID_ACTION');
    }
}

export class InvalidTurnError extends AppError {
    constructor(player: string) {
        super(`Ce n'est pas le tour de [${player}]`, 'INVALID_TURN');
    }
}

export class SocketError extends AppError {
    constructor(socketId: string, reason: string) {
        super(`Erreur socket [${socketId}] : ${reason}`, 'SOCKET_ERROR');
    }
}
