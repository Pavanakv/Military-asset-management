// prisma/seed.js
// Run with: npm run seed
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // --- Bases ---
  const fortAlpha = await prisma.base.create({ data: { name: 'Fort Alpha', location: 'Northern Sector' } });
  const fortBravo = await prisma.base.create({ data: { name: 'Fort Bravo', location: 'Eastern Sector' } });

  // --- Equipment types ---
  const m4 = await prisma.equipmentType.create({ data: { name: 'M4 Carbine', category: 'WEAPON' } });
  const humvee = await prisma.equipmentType.create({ data: { name: 'Humvee', category: 'VEHICLE' } });
  const ammo = await prisma.equipmentType.create({ data: { name: '5.56mm Ammo (case)', category: 'AMMUNITION' } });

  // --- Users ---
  const adminPass = await bcrypt.hash('AdminPass123!', 10);
  const commanderPass = await bcrypt.hash('CommandPass123!', 10);
  const logisticsPass = await bcrypt.hash('LogisticsPass123!', 10);

  const admin = await prisma.user.create({
    data: { username: 'admin_user', passwordHash: adminPass, role: 'ADMIN', baseId: null },
  });
  const commander = await prisma.user.create({
    data: { username: 'commander_alpha', passwordHash: commanderPass, role: 'BASE_COMMANDER', baseId: fortAlpha.id },
  });
  const logistics = await prisma.user.create({
    data: { username: 'logistics_officer', passwordHash: logisticsPass, role: 'LOGISTICS_OFFICER', baseId: fortAlpha.id },
  });

  // --- Sample movements so the dashboard has something to show ---
  await prisma.purchase.create({
    data: { baseId: fortAlpha.id, equipmentTypeId: m4.id, quantity: 50, purchasedById: logistics.id },
  });
  await prisma.purchase.create({
    data: { baseId: fortAlpha.id, equipmentTypeId: ammo.id, quantity: 500, purchasedById: logistics.id },
  });
  await prisma.purchase.create({
    data: { baseId: fortBravo.id, equipmentTypeId: humvee.id, quantity: 5, purchasedById: admin.id },
  });

  await prisma.transfer.create({
    data: {
      sourceBaseId: fortBravo.id,
      destinationBaseId: fortAlpha.id,
      equipmentTypeId: humvee.id,
      quantity: 2,
      status: 'COMPLETED',
      initiatedById: admin.id,
    },
  });

  await prisma.assignment.create({
    data: { baseId: fortAlpha.id, equipmentTypeId: m4.id, quantity: 10, assignedTo: 'Alpha Company', assignedById: commander.id },
  });

  await prisma.expenditure.create({
    data: { baseId: fortAlpha.id, equipmentTypeId: ammo.id, quantity: 80, reason: 'Live-fire training exercise', recordedById: commander.id },
  });

  await prisma.auditLog.create({
    data: { userId: admin.id, action: 'SEED', details: 'Database seeded with sample data.' },
  });

  console.log('Seed complete.');
  console.log('Test accounts:');
  console.log('  admin_user / AdminPass123!        (ADMIN, all bases)');
  console.log('  commander_alpha / CommandPass123!  (BASE_COMMANDER, Fort Alpha)');
  console.log('  logistics_officer / LogisticsPass123! (LOGISTICS_OFFICER, Fort Alpha)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
