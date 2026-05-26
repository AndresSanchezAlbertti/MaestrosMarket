import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UNIONS = [
  { name: 'CTERA', province: 'Nacional' },
  { name: 'SUTEBA', province: 'Buenos Aires' },
  { name: 'UTE', province: 'CABA' },
  { name: 'AMSAFE', province: 'Santa Fe' },
  { name: 'UEPC', province: 'Córdoba' },
  { name: 'AGMER', province: 'Entre Ríos' },
  { name: 'ATEN', province: 'Neuquén' },
  { name: 'UDA', province: 'Nacional' },
];

async function main() {
  console.log('▶ Seed: sindicatos…');
  for (const u of UNIONS) {
    await prisma.union.upsert({
      where: { name: u.name },
      update: { province: u.province, active: true },
      create: { ...u, active: true },
    });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@docenmarket.com';
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.SEED_ADMIN_NAME || 'Administrador';

  console.log(`▶ Seed: admin (${adminEmail})…`);
  const passwordHash = await bcrypt.hash(adminPass, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      verificationStatus: 'VERIFIED',
      fullName: adminName,
    },
    create: {
      email: adminEmail,
      passwordHash,
      fullName: adminName,
      role: 'ADMIN',
      verificationStatus: 'VERIFIED',
    },
  });

  console.log('✔ Seed completo.');
  console.log(`  Admin → ${adminEmail} / ${adminPass}`);
}

main()
  .catch((e) => {
    console.error('✖ Seed fallido:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
