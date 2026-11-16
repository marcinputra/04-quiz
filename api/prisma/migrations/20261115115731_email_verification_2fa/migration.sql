-- CreateEnum
CREATE TYPE "AuthCodePurpose" AS ENUM ('verify_email', 'login_2fa', 'enable_2fa');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified_at" TIMESTAMPTZ,
ADD COLUMN     "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "auth_codes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "purpose" "AuthCodePurpose" NOT NULL,
    "code_hash" VARCHAR(128) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used_at" TIMESTAMPTZ,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auth_codes_user_id_purpose_idx" ON "auth_codes"("user_id", "purpose");

-- CreateIndex
CREATE INDEX "auth_codes_code_hash_idx" ON "auth_codes"("code_hash");

-- AddForeignKey
ALTER TABLE "auth_codes" ADD CONSTRAINT "auth_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Konta istniejące przed wprowadzeniem weryfikacji e-mail uznajemy za potwierdzone,
-- żeby nikt (w tym admin) nie stracił dostępu po aktualizacji.
UPDATE "users" SET "email_verified_at" = "created_at" WHERE "email_verified_at" IS NULL;
