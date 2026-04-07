-- CreateTable
CREATE TABLE "arcs" (
    "id" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "arc_data" JSONB NOT NULL,
    "ip_address" TEXT NOT NULL,
    "fingerprint" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arcs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "id" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "fingerprint" TEXT,
    "arc_count" INTEGER NOT NULL DEFAULT 0,
    "window_start" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_usage_logs" (
    "id" TEXT NOT NULL,
    "arc_id" TEXT NOT NULL,
    "tokens_input" INTEGER NOT NULL,
    "tokens_output" INTEGER NOT NULL,
    "cost_usd" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rate_limits_ip_address_idx" ON "rate_limits"("ip_address");

-- CreateIndex
CREATE INDEX "rate_limits_fingerprint_idx" ON "rate_limits"("fingerprint");

-- CreateIndex
CREATE INDEX "api_usage_logs_arc_id_idx" ON "api_usage_logs"("arc_id");
