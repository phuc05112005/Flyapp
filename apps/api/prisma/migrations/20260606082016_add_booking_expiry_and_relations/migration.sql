-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "BookingItem" ADD COLUMN     "extraServices" JSONB;

-- CreateTable
CREATE TABLE "ExtraService" (
    "id" TEXT NOT NULL,
    "airlineId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceVND" BIGINT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ExtraService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaggageOption" (
    "id" TEXT NOT NULL,
    "airlineId" TEXT,
    "weightKg" INTEGER NOT NULL,
    "priceVND" BIGINT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BaggageOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatTier" (
    "id" TEXT NOT NULL,
    "airlineId" TEXT,
    "name" TEXT NOT NULL,
    "priceVND" BIGINT NOT NULL,
    "description" TEXT,
    "rowRange" TEXT,
    "columnRange" TEXT,
    "color" TEXT,

    CONSTRAINT "SeatTier_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExtraService" ADD CONSTRAINT "ExtraService_airlineId_fkey" FOREIGN KEY ("airlineId") REFERENCES "Airline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaggageOption" ADD CONSTRAINT "BaggageOption_airlineId_fkey" FOREIGN KEY ("airlineId") REFERENCES "Airline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatTier" ADD CONSTRAINT "SeatTier_airlineId_fkey" FOREIGN KEY ("airlineId") REFERENCES "Airline"("id") ON DELETE SET NULL ON UPDATE CASCADE;
