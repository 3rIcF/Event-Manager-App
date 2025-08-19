import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@eventmanager.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 12);
  const manager = await prisma.user.create({
    data: {
      name: 'Max Müller',
      email: 'max.mueller@eventmanager.com',
      password: managerPassword,
      role: 'MANAGER',
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.create({
    data: {
      name: 'Anna Schmidt',
      email: 'anna.schmidt@eventmanager.com',
      password: userPassword,
      role: 'USER',
    },
  });

  // Create test project
  const project = await prisma.project.create({
    data: {
      name: 'Stadtfest München 2025',
      description: 'Jährliches Stadtfest mit Bühnen, Ständen und Fahrgeschäften',
      startDate: new Date('2025-09-15'),
      endDate: new Date('2025-09-17'),
      location: 'München Zentrum',
      status: 'PLANNING',
      budget: 250000,
      responsibleId: manager.id,
    },
  });

  // Create test materials
  const material1 = await prisma.globalMaterial.create({
    data: {
      name: 'Bauzaun Element 3,5m',
      category: 'Absperrung',
      unit: 'Stk',
      specs: 'Standard Bauzaun, feuerverzinkt, 3,5m x 2m',
      portfolio: JSON.stringify(['basic', 'outdoor']),
      standardLeadTime: 2,
      createdById: admin.id,
    },
  });

  const material2 = await prisma.globalMaterial.create({
    data: {
      name: 'LED Spot 50W RGB',
      category: 'Technik',
      unit: 'Stk',
      specs: 'Professioneller LED Scheinwerfer, DMX-steuerbar, IP65',
      portfolio: JSON.stringify(['lighting', 'rgb', 'dmx']),
      standardLeadTime: 5,
      createdById: admin.id,
    },
  });

  // Create project materials
  await prisma.projectMaterial.create({
    data: {
      projectId: project.id,
      globalMaterialId: material1.id,
      quantity: 150,
      phase: 'SETUP',
      location: 'Perimeter Süd',
      deliveryTime: new Date('2025-09-15T08:00:00Z'),
      pickupTime: new Date('2025-09-18T16:00:00Z'),
      needs: JSON.stringify(['stapler', 'crew_2']),
      hasOverride: true,
      overriddenFields: JSON.stringify(['quantity', 'location']),
    },
  });

  // Create test supplier
  const supplier = await prisma.globalSupplier.create({
    data: {
      name: 'Event Tech Solutions GmbH',
      portfolio: JSON.stringify(['lighting', 'audio', 'stages']),
      regions: JSON.stringify(['Bayern', 'Baden-Württemberg']),
      email: 'info@eventtechsolutions.de',
      phone: '+49 89 12345678',
      address: 'Musterstr. 123, 80333 München',
      qualityScore: 4.5,
      punctualityScore: 4.2,
      priceScore: 3.8,
      overallScore: 4.2,
    },
  });

  // Create project supplier
  await prisma.projectSupplier.create({
    data: {
      projectId: project.id,
      globalSupplierId: supplier.id,
      arrivalTime: new Date('2025-09-14T10:00:00Z'),
      setupTime: new Date('2025-09-15T06:00:00Z'),
      operationTime: new Date('2025-09-15T18:00:00Z'),
      teardownTime: new Date('2025-09-18T08:00:00Z'),
      needs: JSON.stringify(['power_32A', 'water_access']),
      personnel: 4,
      vehicles: JSON.stringify(['LKW 7,5t', 'Transporter']),
      onsiteContact: 'Thomas Weber',
    },
  });

  // Create test comment
  await prisma.comment.create({
    data: {
      entityType: 'MATERIAL',
      entityId: material1.id,
      scope: 'GLOBAL',
      content: 'Neuer Lieferant verfügbar - bessere Preise möglich',
      authorId: manager.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Admin User: admin@eventmanager.com / admin123`);
  console.log(`👤 Manager User: max.mueller@eventmanager.com / manager123`);
  console.log(`👤 Regular User: anna.schmidt@eventmanager.com / user123`);
  console.log(`🎯 Test Project: ${project.name}`);
  console.log(`📦 Materials: ${material1.name}, ${material2.name}`);
  console.log(`🏢 Supplier: ${supplier.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });