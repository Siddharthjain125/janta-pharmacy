import { PrismaClient, UserRole, UserStatus, ProductCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Database Seed Script
 *
 * Creates initial data for development:
 * - Admin user
 * - Sample customer users
 * - Sample products across categories
 *
 * Usage:
 *   npm run db:seed
 *
 * Note: This script is idempotent - running it multiple times won't create duplicates
 * because it uses upsert operations based on unique fields.
 */
async function main() {
  console.log('🌱 Seeding database...\n');

  // ==========================================================================
  // Seed Users
  // ==========================================================================
  console.log('👤 Creating users...');

  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { phoneNumber: '+919999900000' },
    update: {},
    create: {
      phoneNumber: '+919999900000',
      name: 'Admin User',
      email: 'admin@jantapharmacy.com',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`   ✓ Admin: ${adminUser.name} (${adminUser.phoneNumber})`);

  // Create admin credentials (password: admin123)
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  await prisma.credential.upsert({
    where: { userId: adminUser.id },
    update: { passwordHash: adminPasswordHash },
    create: {
      userId: adminUser.id,
      passwordHash: adminPasswordHash,
    },
  });

  // Pharmacist user
  const pharmacistUser = await prisma.user.upsert({
    where: { phoneNumber: '+919999900001' },
    update: {},
    create: {
      phoneNumber: '+919999900001',
      name: 'Dr. Priya Sharma',
      email: 'pharmacist@jantapharmacy.com',
      role: UserRole.PHARMACIST,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`   ✓ Pharmacist: ${pharmacistUser.name} (${pharmacistUser.phoneNumber})`);

  // Create pharmacist credentials (password: pharma123)
  const pharmacistPasswordHash = await bcrypt.hash('pharma123', 10);
  await prisma.credential.upsert({
    where: { userId: pharmacistUser.id },
    update: { passwordHash: pharmacistPasswordHash },
    create: {
      userId: pharmacistUser.id,
      passwordHash: pharmacistPasswordHash,
    },
  });

  // Staff user
  const staffUser = await prisma.user.upsert({
    where: { phoneNumber: '+919999900002' },
    update: {},
    create: {
      phoneNumber: '+919999900002',
      name: 'Rahul Kumar',
      email: 'staff@jantapharmacy.com',
      role: UserRole.STAFF,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`   ✓ Staff: ${staffUser.name} (${staffUser.phoneNumber})`);

  // Create staff credentials (password: staff123)
  const staffPasswordHash = await bcrypt.hash('staff123', 10);
  await prisma.credential.upsert({
    where: { userId: staffUser.id },
    update: { passwordHash: staffPasswordHash },
    create: {
      userId: staffUser.id,
      passwordHash: staffPasswordHash,
    },
  });

  // Customer users
  const customer1 = await prisma.user.upsert({
    where: { phoneNumber: '+919876543210' },
    update: {},
    create: {
      phoneNumber: '+919876543210',
      name: 'Amit Patel',
      email: 'amit@example.com',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`   ✓ Customer: ${customer1.name} (${customer1.phoneNumber})`);

  // Create customer credentials (password: customer123)
  const customer1PasswordHash = await bcrypt.hash('customer123', 10);
  await prisma.credential.upsert({
    where: { userId: customer1.id },
    update: { passwordHash: customer1PasswordHash },
    create: {
      userId: customer1.id,
      passwordHash: customer1PasswordHash,
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { phoneNumber: '+919876543211' },
    update: {},
    create: {
      phoneNumber: '+919876543211',
      name: 'Sneha Gupta',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`   ✓ Customer: ${customer2.name} (${customer2.phoneNumber})`);

  // Create customer2 credentials (password: customer123)
  const customer2PasswordHash = await bcrypt.hash('customer123', 10);
  await prisma.credential.upsert({
    where: { userId: customer2.id },
    update: { passwordHash: customer2PasswordHash },
    create: {
      userId: customer2.id,
      passwordHash: customer2PasswordHash,
    },
  });

  // ==========================================================================
  // Seed Products
  // ==========================================================================
  console.log('\n💊 Creating products...');

  const products = [
    // General Medicines
    {
      id: 'prod-001',
      name: 'Paracetamol 500mg',
      description: 'Pain relief and fever reduction tablets. Pack of 10.',
      category: ProductCategory.GENERAL,
      priceAmount: 2500, // ₹25.00 in paise
      requiresPrescription: false,
    },
    {
      id: 'prod-002',
      name: 'Cetirizine 10mg',
      description: 'Antihistamine for allergy relief. Pack of 10.',
      category: ProductCategory.GENERAL,
      priceAmount: 4500, // ₹45.00
      requiresPrescription: false,
    },
    {
      id: 'prod-003',
      name: 'Ibuprofen 400mg',
      description: 'Anti-inflammatory pain relief. Pack of 10.',
      category: ProductCategory.GENERAL,
      priceAmount: 3500, // ₹35.00
      requiresPrescription: false,
    },

    // Prescription Medicines
    {
      id: 'prod-004',
      name: 'Amoxicillin 500mg',
      description: 'Antibiotic capsules. Pack of 10. Prescription required.',
      category: ProductCategory.PRESCRIPTION,
      priceAmount: 12000, // ₹120.00
      requiresPrescription: true,
    },
    {
      id: 'prod-005',
      name: 'Omeprazole 20mg',
      description: 'Proton pump inhibitor for acid reflux. Pack of 14.',
      category: ProductCategory.PRESCRIPTION,
      priceAmount: 8500, // ₹85.00
      requiresPrescription: true,
    },
    {
      id: 'prod-006',
      name: 'Metformin 500mg',
      description: 'Diabetes management medication. Pack of 20.',
      category: ProductCategory.PRESCRIPTION,
      priceAmount: 15000, // ₹150.00
      requiresPrescription: true,
    },

    // Ayurvedic Products
    {
      id: 'prod-007',
      name: 'Chyawanprash 500g',
      description: 'Traditional Ayurvedic immunity booster.',
      category: ProductCategory.AYURVEDIC,
      priceAmount: 32000, // ₹320.00
      requiresPrescription: false,
    },
    {
      id: 'prod-008',
      name: 'Ashwagandha Capsules',
      description: 'Stress relief and vitality. Pack of 60.',
      category: ProductCategory.AYURVEDIC,
      priceAmount: 28000, // ₹280.00
      requiresPrescription: false,
    },
    {
      id: 'prod-009',
      name: 'Triphala Churna 100g',
      description: 'Digestive health and detox powder.',
      category: ProductCategory.AYURVEDIC,
      priceAmount: 12000, // ₹120.00
      requiresPrescription: false,
    },

    // Health Devices
    {
      id: 'prod-010',
      name: 'Digital Thermometer',
      description: 'Fast and accurate body temperature measurement.',
      category: ProductCategory.HEALTH_DEVICES,
      priceAmount: 19900, // ₹199.00
      requiresPrescription: false,
    },
    {
      id: 'prod-011',
      name: 'Blood Pressure Monitor',
      description: 'Automatic digital BP monitor for home use.',
      category: ProductCategory.HEALTH_DEVICES,
      priceAmount: 185000, // ₹1850.00
      requiresPrescription: false,
    },
    {
      id: 'prod-012',
      name: 'Pulse Oximeter',
      description: 'Finger pulse oximeter for SpO2 monitoring.',
      category: ProductCategory.HEALTH_DEVICES,
      priceAmount: 89900, // ₹899.00
      requiresPrescription: false,
    },

    // Supplements
    {
      id: 'prod-013',
      name: 'Vitamin D3 1000 IU',
      description: 'Supports bone health and immunity. 60 tablets.',
      category: ProductCategory.SUPPLEMENTS,
      priceAmount: 45000, // ₹450.00
      requiresPrescription: false,
    },
    {
      id: 'prod-014',
      name: 'Omega-3 Fish Oil',
      description: 'Heart and brain health support. 60 softgels.',
      category: ProductCategory.SUPPLEMENTS,
      priceAmount: 62000, // ₹620.00
      requiresPrescription: false,
    },
    {
      id: 'prod-015',
      name: 'Multivitamin Daily',
      description: 'Complete daily nutrition. 30 tablets.',
      category: ProductCategory.SUPPLEMENTS,
      priceAmount: 35000, // ₹350.00
      requiresPrescription: false,
    },

    // First Aid
    {
      id: 'prod-016',
      name: 'First Aid Kit',
      description: 'Complete first aid kit with bandages, antiseptic, and more.',
      category: ProductCategory.FIRST_AID,
      priceAmount: 39900, // ₹399.00
      requiresPrescription: false,
    },
    {
      id: 'prod-017',
      name: 'Antiseptic Solution 100ml',
      description: 'Dettol antiseptic liquid for wound cleaning.',
      category: ProductCategory.FIRST_AID,
      priceAmount: 8500, // ₹85.00
      requiresPrescription: false,
    },

    // Baby Care
    {
      id: 'prod-018',
      name: 'Baby Diapers (Medium)',
      description: 'Soft and absorbent diapers. Pack of 44.',
      category: ProductCategory.BABY_CARE,
      priceAmount: 79900, // ₹799.00
      requiresPrescription: false,
    },
    {
      id: 'prod-019',
      name: 'Baby Lotion 200ml',
      description: 'Gentle moisturizing lotion for baby skin.',
      category: ProductCategory.BABY_CARE,
      priceAmount: 22000, // ₹220.00
      requiresPrescription: false,
    },

    // Personal Care
    {
      id: 'prod-020',
      name: 'Sunscreen SPF 50',
      description: 'Broad spectrum sun protection. 100ml.',
      category: ProductCategory.PERSONAL_CARE,
      priceAmount: 35000, // ₹350.00
      requiresPrescription: false,
    },
    {
      id: 'prod-021',
      name: 'Hand Sanitizer 500ml',
      description: '70% alcohol-based hand sanitizer.',
      category: ProductCategory.PERSONAL_CARE,
      priceAmount: 15000, // ₹150.00
      requiresPrescription: false,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        priceAmount: product.priceAmount,
        priceCurrency: 'INR',
        requiresPrescription: product.requiresPrescription,
        isActive: true,
      },
    });
    console.log(`   ✓ ${created.name} (${created.category})`);
  }

  // ==========================================================================
  // Summary
  // ==========================================================================
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();

  console.log('\n✅ Seeding complete!');
  console.log(`   Users: ${userCount}`);
  console.log(`   Products: ${productCount}`);
  console.log('\n📝 Test credentials:');
  console.log('   Admin:     +919999900000 / admin123');
  console.log('   Pharmacist: +919999900001 / pharma123');
  console.log('   Staff:     +919999900002 / staff123');
  console.log('   Customer:  +919876543210 / customer123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

