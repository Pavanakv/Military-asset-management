-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER');

-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('WEAPON', 'VEHICLE', 'AMMUNITION');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'COMPLETED');

-- CreateTable
CREATE TABLE "bases" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "base_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "EquipmentCategory" NOT NULL,

    CONSTRAINT "equipment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" SERIAL NOT NULL,
    "base_id" INTEGER NOT NULL,
    "equipment_type_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purchased_by" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" SERIAL NOT NULL,
    "source_base_id" INTEGER NOT NULL,
    "destination_base_id" INTEGER NOT NULL,
    "equipment_type_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'COMPLETED',
    "initiated_by" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" SERIAL NOT NULL,
    "base_id" INTEGER NOT NULL,
    "equipment_type_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "assigned_to" TEXT NOT NULL,
    "assigned_by" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenditures" (
    "id" SERIAL NOT NULL,
    "base_id" INTEGER NOT NULL,
    "equipment_type_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "recorded_by" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenditures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "purchases_base_id_idx" ON "purchases"("base_id");

-- CreateIndex
CREATE INDEX "purchases_equipment_type_id_idx" ON "purchases"("equipment_type_id");

-- CreateIndex
CREATE INDEX "purchases_created_at_idx" ON "purchases"("created_at");

-- CreateIndex
CREATE INDEX "transfers_source_base_id_idx" ON "transfers"("source_base_id");

-- CreateIndex
CREATE INDEX "transfers_destination_base_id_idx" ON "transfers"("destination_base_id");

-- CreateIndex
CREATE INDEX "transfers_equipment_type_id_idx" ON "transfers"("equipment_type_id");

-- CreateIndex
CREATE INDEX "transfers_created_at_idx" ON "transfers"("created_at");

-- CreateIndex
CREATE INDEX "assignments_base_id_idx" ON "assignments"("base_id");

-- CreateIndex
CREATE INDEX "assignments_equipment_type_id_idx" ON "assignments"("equipment_type_id");

-- CreateIndex
CREATE INDEX "assignments_created_at_idx" ON "assignments"("created_at");

-- CreateIndex
CREATE INDEX "expenditures_base_id_idx" ON "expenditures"("base_id");

-- CreateIndex
CREATE INDEX "expenditures_equipment_type_id_idx" ON "expenditures"("equipment_type_id");

-- CreateIndex
CREATE INDEX "expenditures_created_at_idx" ON "expenditures"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_base_id_fkey" FOREIGN KEY ("base_id") REFERENCES "bases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_base_id_fkey" FOREIGN KEY ("base_id") REFERENCES "bases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_equipment_type_id_fkey" FOREIGN KEY ("equipment_type_id") REFERENCES "equipment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_purchased_by_fkey" FOREIGN KEY ("purchased_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_source_base_id_fkey" FOREIGN KEY ("source_base_id") REFERENCES "bases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_destination_base_id_fkey" FOREIGN KEY ("destination_base_id") REFERENCES "bases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_equipment_type_id_fkey" FOREIGN KEY ("equipment_type_id") REFERENCES "equipment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_initiated_by_fkey" FOREIGN KEY ("initiated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_base_id_fkey" FOREIGN KEY ("base_id") REFERENCES "bases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_equipment_type_id_fkey" FOREIGN KEY ("equipment_type_id") REFERENCES "equipment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenditures" ADD CONSTRAINT "expenditures_base_id_fkey" FOREIGN KEY ("base_id") REFERENCES "bases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenditures" ADD CONSTRAINT "expenditures_equipment_type_id_fkey" FOREIGN KEY ("equipment_type_id") REFERENCES "equipment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenditures" ADD CONSTRAINT "expenditures_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
