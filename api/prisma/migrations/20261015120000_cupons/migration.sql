-- CreateTable
CREATE TABLE "Coupon" (
    "code" VARCHAR(30) NOT NULL,
    "percentOff" INTEGER NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("code")
);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "couponCode" VARCHAR(30),
ADD COLUMN     "discountBrl" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Seed: cupons
INSERT INTO "Coupon" ("code", "percentOff", "validUntil") VALUES
  ('SPEED10', 10, '2099-12-31 23:59:59'),
  ('VERAO25', 25, '2026-03-31 23:59:59');
