import { PrismaClient, UserRole, EmploymentStatus, OrgSize } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

import { randomBytes, pbkdf2Sync } from 'crypto';

// Utility for hashing passwords (same as auth service)
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('=== Seeding Acme Corp Enterprise Dummy Data ===\n');

  const passwordHash = hashPassword('password123');

  // 1. Create Organization (Acme Corp)
  const org = await prisma.organization.upsert({
    where: { id: 'org-acme-1' },
    update: {},
    create: {
      id: 'org-acme-1',
      name: 'Acme Corp',
      industry: 'Technology',
      size: OrgSize.ENTERPRISE,
      billingEmail: 'billing@acme.com',
    },
  });
  console.log(`  ✓ Seeding organization: ${org.name}`);

  // 2. Create Admin User for Acme (so user can login)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: { role: UserRole.ORGANIZATION_ADMIN, onboarded: true, passwordHash },
    create: {
      id: 'user-acme-admin',
      email: 'admin@acme.com',
      name: 'Acme Admin',
      passwordHash,
      role: UserRole.ORGANIZATION_ADMIN,
      onboarded: true,
    },
  });

  await prisma.organizationAdmin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      id: 'orgadmin-acme',
      userId: adminUser.id,
      organizationId: org.id,
      role: 'ADMIN',
    },
  });
  console.log(`  ✓ Created Admin User: admin@acme.com (password: password123)`);

  // 3. Create Engineering Department
  const deptEng = await prisma.department.upsert({
    where: { id: 'dept-eng' },
    update: {},
    create: {
      id: 'dept-eng',
      organizationId: org.id,
      name: 'Engineering',
      description: 'Software Engineering Department',
    },
  });

  // 4. Create Sales Department
  const deptSales = await prisma.department.upsert({
    where: { id: 'dept-sales' },
    update: {},
    create: {
      id: 'dept-sales',
      organizationId: org.id,
      name: 'Sales',
      description: 'Global Sales Team',
    },
  });
  console.log(`  ✓ Created Departments: Engineering, Sales`);

  // 5. Create Employees (Alice & Bob)
  
  // Alice (Engineering)
  const aliceUser = await prisma.user.upsert({
    where: { email: 'alice@acme.com' },
    update: { role: UserRole.EMPLOYEE },
    create: {
      id: 'u-alice',
      email: 'alice@acme.com',
      name: 'Alice Smith',
      passwordHash,
      role: UserRole.EMPLOYEE,
      onboarded: true,
    },
  });

  const empAlice = await prisma.employee.upsert({
    where: { userId: aliceUser.id },
    update: {},
    create: {
      id: 'emp-alice',
      userId: aliceUser.id,
      organizationId: org.id,
      departmentId: deptEng.id,
      title: 'VP of Engineering',
      employmentStatus: EmploymentStatus.ACTIVE,
      joinedAt: new Date(),
    },
  });

  // Assign Alice as manager of Engineering
  await prisma.department.update({
    where: { id: deptEng.id },
    data: { managerId: empAlice.id },
  });

  // Bob (Sales)
  const bobUser = await prisma.user.upsert({
    where: { email: 'bob@acme.com' },
    update: { role: UserRole.EMPLOYEE },
    create: {
      id: 'u-bob',
      email: 'bob@acme.com',
      name: 'Bob Jones',
      passwordHash,
      role: UserRole.EMPLOYEE,
      onboarded: true,
    },
  });

  const empBob = await prisma.employee.upsert({
    where: { userId: bobUser.id },
    update: {},
    create: {
      id: 'emp-bob',
      userId: bobUser.id,
      organizationId: org.id,
      departmentId: deptSales.id,
      title: 'Head of Sales',
      employmentStatus: EmploymentStatus.ACTIVE,
      joinedAt: new Date(),
    },
  });

  // Assign Bob as manager of Sales
  await prisma.department.update({
    where: { id: deptSales.id },
    data: { managerId: empBob.id },
  });

  console.log(`  ✓ Created Employees: Alice (Engineering), Bob (Sales)`);
  console.log('\n=== Seeding Complete ===\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
