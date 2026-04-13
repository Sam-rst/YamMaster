-- CreateEnum
CREATE TYPE "BotDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable: ajout colonne avatar sur users
ALTER TABLE "users" ADD COLUMN "avatar" TEXT NOT NULL DEFAULT '🎲';

-- AlterTable: ajout colonne difficulty sur game_players
ALTER TABLE "game_players" ADD COLUMN "difficulty" "BotDifficulty";
