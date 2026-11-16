-- AlterEnum
ALTER TYPE "AuthCodePurpose" ADD VALUE 'password_reset';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "token_version" INTEGER NOT NULL DEFAULT 0;
