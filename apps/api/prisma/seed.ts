import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starte Datenbank-Seeding...');

  // Standard-Rollen erstellen
  console.log('📝 Erstelle Standard-Rollen...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'System-Administrator mit vollen Rechten'
    }
  });

  const organizerRole = await prisma.role.upsert({
    where: { name: 'ORGANIZER' },
    update: {},
    create: {
      name: 'ORGANIZER',
      description: 'Event-Organisator mit Projektverwaltungsrechten'
    }
  });

  const onsiteRole = await prisma.role.upsert({
    where: { name: 'ONSITE' },
    update: {},
    create: {
      name: 'ONSITE',
      description: 'Onsite-Team mit Ausführungsrechten'
    }
  });

  const vendorRole = await prisma.role.upsert({
    where: { name: 'EXTERNAL_VENDOR' },
    update: {},
    create: {
      name: 'EXTERNAL_VENDOR',
      description: 'Externer Lieferant mit eingeschränkten Rechten'
    }
  });

  // Standard-Berechtigungen erstellen
  console.log('🔐 Erstelle Standard-Berechtigungen...');
  const permissions = [
    // Projekt-Berechtigungen
    { name: 'project:create', description: 'Projekte erstellen', resource: 'project', action: 'create' },
    { name: 'project:read', description: 'Projekte lesen', resource: 'project', action: 'read' },
    { name: 'project:update', description: 'Projekte bearbeiten', resource: 'project', action: 'update' },
    { name: 'project:delete', description: 'Projekte löschen', resource: 'project', action: 'delete' },
    
    // BOM-Berechtigungen
    { name: 'bom:create', description: 'BOM-Items erstellen', resource: 'bom', action: 'create' },
    { name: 'bom:read', description: 'BOM-Items lesen', resource: 'bom', action: 'read' },
    { name: 'bom:update', description: 'BOM-Items bearbeiten', resource: 'bom', action: 'update' },
    { name: 'bom:delete', description: 'BOM-Items löschen', resource: 'bom', action: 'delete' },
    
    // Lieferanten-Berechtigungen
    { name: 'supplier:create', description: 'Lieferanten erstellen', resource: 'supplier', action: 'create' },
    { name: 'supplier:read', description: 'Lieferanten lesen', resource: 'supplier', action: 'read' },
    { name: 'supplier:update', description: 'Lieferanten bearbeiten', resource: 'supplier', action: 'update' },
    { name: 'supplier:delete', description: 'Lieferanten löschen', resource: 'supplier', action: 'delete' },
    
    // Task-Berechtigungen
    { name: 'task:create', description: 'Aufgaben erstellen', resource: 'task', action: 'create' },
    { name: 'task:read', description: 'Aufgaben lesen', resource: 'task', action: 'read' },
    { name: 'task:update', description: 'Aufgaben bearbeiten', resource: 'task', action: 'update' },
    { name: 'task:delete', description: 'Aufgaben löschen', resource: 'task', action: 'delete' },
    
    // Genehmigungs-Berechtigungen
    { name: 'permit:create', description: 'Genehmigungen erstellen', resource: 'permit', action: 'create' },
    { name: 'permit:read', description: 'Genehmigungen lesen', resource: 'permit', action: 'read' },
    { name: 'permit:update', description: 'Genehmigungen bearbeiten', resource: 'permit', action: 'update' },
    { name: 'permit:approve', description: 'Genehmigungen genehmigen', resource: 'permit', action: 'approve' },
    
    // Benutzer-Berechtigungen
    { name: 'user:create', description: 'Benutzer erstellen', resource: 'user', action: 'create' },
    { name: 'user:read', description: 'Benutzer lesen', resource: 'user', action: 'read' },
    { name: 'user:update', description: 'Benutzer bearbeiten', resource: 'user', action: 'update' },
    { name: 'user:delete', description: 'Benutzer löschen', resource: 'user', action: 'delete' },
  ];

  for (const permissionData of permissions) {
    await prisma.permission.upsert({
      where: { name: permissionData.name },
      update: {},
      create: permissionData
    });
  }

  // Admin-Benutzer alle Berechtigungen zuweisen
  const allPermissions = await prisma.permission.findMany();
  await prisma.role.update({
    where: { id: adminRole.id },
    data: {
      permissions: {
        connect: allPermissions.map(p => ({ id: p.id }))
      }
    }
  });

  // Organizer-Berechtigungen zuweisen
  const organizerPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: [
          'project:create', 'project:read', 'project:update',
          'bom:create', 'bom:read', 'bom:update',
          'supplier:create', 'supplier:read', 'supplier:update',
          'task:create', 'task:read', 'task:update',
          'permit:create', 'permit:read', 'permit:update',
          'user:read'
        ]
      }
    }
  });

  await prisma.role.update({
    where: { id: organizerRole.id },
    data: {
      permissions: {
        connect: organizerPermissions.map(p => ({ id: p.id }))
      }
    }
  });

  // Standard-Kategorien erstellen
  console.log('📂 Erstelle Standard-Kategorien...');
  const materialCategory = await prisma.category.upsert({
    where: { name: 'Materialien' },
    update: {},
    create: {
      name: 'Materialien',
      description: 'Baumaterialien und Verbrauchsstoffe',
      color: '#3B82F6',
      icon: 'package'
    }
  });

  const equipmentCategory = await prisma.category.upsert({
    where: { name: 'Ausrüstung' },
    update: {},
    create: {
      name: 'Ausrüstung',
      description: 'Technische Ausrüstung und Geräte',
      color: '#10B981',
      icon: 'settings'
    }
  });

  const serviceCategory = await prisma.category.upsert({
    where: { name: 'Dienstleistungen' },
    update: {},
    create: {
      name: 'Dienstleistungen',
      description: 'Externe Dienstleistungen und Services',
      color: '#F59E0B',
      icon: 'users'
    }
  });

  const laborCategory = await prisma.category.upsert({
    where: { name: 'Arbeitskraft' },
    update: {},
    create: {
      name: 'Arbeitskraft',
      description: 'Personelle Ressourcen und Arbeitszeit',
      color: '#EF4444',
      icon: 'user-check'
    }
  });

  // Admin-User erstellen
  console.log('👤 Erstelle Admin-Benutzer...');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@elementaro.com' },
    update: {},
    create: {
      email: 'admin@elementaro.com',
      passwordHash: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      department: 'IT',
      position: 'System Administrator'
    }
  });

  // Admin-User der Admin-Rolle zuweisen
  await prisma.role.update({
    where: { id: adminRole.id },
    data: {
      users: {
        connect: { id: adminUser.id }
      }
    }
  });

  // Demo-Organizer erstellen
  console.log('👥 Erstelle Demo-Organizer...');
  const organizerPassword = await bcrypt.hash('organizer123', 12);
  
  const demoOrganizer = await prisma.user.upsert({
    where: { email: 'organizer@elementaro.com' },
    update: {},
    create: {
      email: 'organizer@elementaro.com',
      passwordHash: organizerPassword,
      name: 'Demo Organizer',
      role: 'ORGANIZER',
      department: 'Event Management',
      position: 'Senior Event Organizer'
    }
  });

  // Demo-Organizer der Organizer-Rolle zuweisen
  await prisma.role.update({
    where: { id: organizerRole.id },
    data: {
      users: {
        connect: { id: demoOrganizer.id }
      }
    }
  });

  // Demo-Projekt erstellen
  console.log('🎯 Erstelle Demo-Projekt...');
  const demoProject = await prisma.project.upsert({
    where: { name: 'Demo Event 2024' },
    update: {},
    create: {
      name: 'Demo Event 2024',
      description: 'Ein Demonstrationsprojekt für die Event-Manager-Anwendung',
      status: 'PLANNING',
      dateFrom: new Date('2024-06-01'),
      dateTo: new Date('2024-06-03'),
      startDate: new Date('2024-06-01'),
      locationName: 'Demo Location',
      address: 'Demo Street 123, 12345 Demo City',
      ownerId: demoOrganizer.id,
      budgetEstimate: 50000,
      currency: 'EUR',
      priority: 'MEDIUM',
      tags: ['demo', 'event', '2024']
    }
  });

  // Demo-BOM-Items erstellen
  console.log('📋 Erstelle Demo-BOM-Items...');
  const demoBOMItems = [
    {
      name: 'Bühne',
      description: 'Hauptbühne für das Event',
      type: 'EQUIPMENT',
      quantity: 1,
      unit: 'Stück',
      cost: 5000,
      categoryId: equipmentCategory.id,
      notes: 'Modulare Bühne mit 6x4m Grundfläche'
    },
    {
      name: 'PA-System',
      description: 'Beschallungsanlage',
      type: 'EQUIPMENT',
      quantity: 1,
      unit: 'Set',
      cost: 3000,
      categoryId: equipmentCategory.id,
      notes: 'Komplettes PA-System mit Verstärkern und Boxen'
    },
    {
      name: 'Verbindungskabel',
      description: 'XLR und Speakon Kabel',
      type: 'MATERIAL',
      quantity: 50,
      unit: 'Meter',
      cost: 2.5,
      categoryId: materialCategory.id,
      notes: 'Hochwertige Kabel für Audio- und Videoübertragung'
    },
    {
      name: 'Techniker',
      description: 'Technischer Support vor Ort',
      type: 'LABOR',
      quantity: 2,
      unit: 'Person/Tag',
      cost: 200,
      categoryId: laborCategory.id,
      notes: 'Qualifizierte Techniker für Setup und Abbau'
    }
  ];

  for (const bomItemData of demoBOMItems) {
    await prisma.bomItem.create({
      data: {
        ...bomItemData,
        projectId: demoProject.id
      }
    });
  }

  // Demo-Lieferanten erstellen
  console.log('🏢 Erstelle Demo-Lieferanten...');
  const demoSuppliers = [
    {
      name: 'EventTech GmbH',
      description: 'Spezialist für Event-Technik und Ausrüstung',
      contactPerson: 'Max Mustermann',
      email: 'info@eventtech.de',
      phone: '+49 30 12345678',
      website: 'https://eventtech.de',
      address: 'Technikstraße 1',
      city: 'Berlin',
      country: 'Deutschland',
      postalCode: '10115',
      rating: 4.5
    },
    {
      name: 'StageBuild Solutions',
      description: 'Professioneller Bühnenbau und Veranstaltungstechnik',
      contactPerson: 'Anna Schmidt',
      email: 'kontakt@stagebuild.de',
      phone: '+49 40 87654321',
      website: 'https://stagebuild.de',
      address: 'Bühnenweg 15',
      city: 'Hamburg',
      country: 'Deutschland',
      postalCode: '20095',
      rating: 4.8
    }
  ];

  for (const supplierData of demoSuppliers) {
    await prisma.supplier.create({
      data: supplierData
    });
  }

  // Demo-Tasks erstellen
  console.log('✅ Erstelle Demo-Tasks...');
  const demoTasks = [
    {
      name: 'Projektplanung abschließen',
      description: 'Alle Projektdetails finalisieren und genehmigen lassen',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date('2024-05-15'),
      estimatedHours: 8,
      tags: ['planning', 'approval']
    },
    {
      name: 'Lieferanten auswählen',
      description: 'Finale Lieferantenauswahl basierend auf Angeboten',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date('2024-05-20'),
      estimatedHours: 4,
      tags: ['supplier', 'selection']
    },
    {
      name: 'Technik-Equipment bestellen',
      description: 'Alle technischen Geräte bei Lieferanten bestellen',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date('2024-05-25'),
      estimatedHours: 3,
      tags: ['equipment', 'ordering']
    }
  ];

  for (const taskData of demoTasks) {
    await prisma.task.create({
      data: {
        ...taskData,
        projectId: demoProject.id,
        assigneeId: demoOrganizer.id
      }
    });
  }

  // Demo-Slots erstellen
  console.log('⏰ Erstelle Demo-Slots...');
  const demoSlots = [
    {
      name: 'Setup Tag 1',
      type: 'SETUP',
      dateFrom: new Date('2024-06-01T08:00:00Z'),
      dateTo: new Date('2024-06-01T18:00:00Z'),
      location: 'Hauptbühne',
      description: 'Aufbau der Hauptbühne und technischen Ausrüstung'
    },
    {
      name: 'Event Tag 1',
      type: 'EVENT',
      dateFrom: new Date('2024-06-01T19:00:00Z'),
      dateTo: new Date('2024-06-01T23:00:00Z'),
      location: 'Hauptbühne',
      description: 'Hauptveranstaltung am ersten Tag'
    },
    {
      name: 'Teardown Tag 3',
      type: 'TEARDOWN',
      dateFrom: new Date('2024-06-03T09:00:00Z'),
      dateTo: new Date('2024-06-03T17:00:00Z'),
      location: 'Hauptbühne',
      description: 'Abbau aller technischen Einrichtungen'
    }
  ];

  for (const slotData of demoSlots) {
    await prisma.slot.create({
      data: {
        ...slotData,
        projectId: demoProject.id
      }
    });
  }

  console.log('✅ Datenbank-Seeding erfolgreich abgeschlossen!');
  console.log('');
  console.log('📊 Erstellte Daten:');
  console.log(`   - ${await prisma.role.count()} Rollen`);
  console.log(`   - ${await prisma.permission.count()} Berechtigungen`);
  console.log(`   - ${await prisma.category.count()} Kategorien`);
  console.log(`   - ${await prisma.user.count()} Benutzer`);
  console.log(`   - ${await prisma.project.count()} Projekte`);
  console.log(`   - ${await prisma.bomItem.count()} BOM-Items`);
  console.log(`   - ${await prisma.supplier.count()} Lieferanten`);
  console.log(`   - ${await prisma.task.count()} Tasks`);
  console.log(`   - ${await prisma.slot.count()} Slots`);
  console.log('');
  console.log('🔑 Standard-Anmeldedaten:');
  console.log('   Admin: admin@elementaro.com / admin123');
  console.log('   Organizer: organizer@elementaro.com / organizer123');
}

main()
  .catch((e) => {
    console.error('❌ Fehler beim Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
