CREATE TABLE "AgencyPaymentSetting" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL DEFAULT 'Vietcombank',
    "accountNumber" TEXT NOT NULL DEFAULT '0123456789',
    "accountName" TEXT NOT NULL DEFAULT 'CONG TY VIETFLY AGENCY',
    "branch" TEXT,
    "qrImageDataUrl" TEXT,
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgencyPaymentSetting_pkey" PRIMARY KEY ("id")
);
