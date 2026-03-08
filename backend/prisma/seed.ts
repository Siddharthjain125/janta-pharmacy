import {
  PrismaClient,
  UserRole,
  UserStatus,
  ProductCategory,
  NewsletterStatus,
} from '@prisma/client';
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
    { id: 'prod-001', name: 'Paracetamol 500mg', description: 'Pain relief and fever reduction tablets. Pack of 10.', category: ProductCategory.GENERAL, priceAmount: 2500, requiresPrescription: false, isFeatured: true },
    { id: 'prod-002', name: 'Crocin Advance', description: 'Fast acting pain and fever relief tablets.', category: ProductCategory.GENERAL, priceAmount: 5400, requiresPrescription: false, isFeatured: true },
    { id: 'prod-003', name: 'Ibuprofen 400mg', description: 'Anti-inflammatory pain relief. Pack of 10.', category: ProductCategory.GENERAL, priceAmount: 3500, requiresPrescription: false, isFeatured: false },
    { id: 'prod-004', name: 'Cetirizine 10mg', description: 'Antihistamine for allergy relief. Pack of 10.', category: ProductCategory.GENERAL, priceAmount: 4500, requiresPrescription: false, isFeatured: false },
    { id: 'prod-005', name: 'Azithromycin 500mg', description: 'Broad-spectrum antibiotic tablets. Pack of 3.', category: ProductCategory.PRESCRIPTION, priceAmount: 13000, requiresPrescription: true, isFeatured: false },
    { id: 'prod-006', name: 'Amoxicillin 500mg', description: 'Antibiotic capsules. Pack of 10.', category: ProductCategory.PRESCRIPTION, priceAmount: 12000, requiresPrescription: true, isFeatured: false },
    { id: 'prod-007', name: 'Metformin 500mg', description: 'Diabetes management medication. Pack of 20.', category: ProductCategory.PRESCRIPTION, priceAmount: 15000, requiresPrescription: true, isFeatured: true },
    { id: 'prod-008', name: 'Telmisartan 40mg', description: 'Blood pressure management medicine. Pack of 15.', category: ProductCategory.PRESCRIPTION, priceAmount: 16800, requiresPrescription: true, isFeatured: false },
    { id: 'prod-009', name: 'Atorvastatin 10mg', description: 'Cholesterol control tablets. Pack of 10.', category: ProductCategory.PRESCRIPTION, priceAmount: 9900, requiresPrescription: true, isFeatured: false },
    { id: 'prod-010', name: 'Vitamin D3 1000 IU', description: 'Supports bone health and immunity. 60 tablets.', category: ProductCategory.SUPPLEMENTS, priceAmount: 45000, requiresPrescription: false, isFeatured: true },
    { id: 'prod-011', name: 'Vitamin C 500mg', description: 'Daily immunity support tablets. Pack of 60.', category: ProductCategory.SUPPLEMENTS, priceAmount: 22000, requiresPrescription: false, isFeatured: true },
    { id: 'prod-012', name: 'Zinc Tablets', description: 'Essential mineral supplement. Pack of 30.', category: ProductCategory.SUPPLEMENTS, priceAmount: 18000, requiresPrescription: false, isFeatured: false },
    { id: 'prod-013', name: 'Protein Supplement Vanilla', description: 'High protein powder for daily nutrition.', category: ProductCategory.SUPPLEMENTS, priceAmount: 149900, requiresPrescription: false, isFeatured: false },
    { id: 'prod-014', name: 'Omega-3 Fish Oil', description: 'Heart and brain health support. 60 softgels.', category: ProductCategory.SUPPLEMENTS, priceAmount: 62000, requiresPrescription: false, isFeatured: false },
    { id: 'prod-015', name: 'Multivitamin Daily', description: 'Complete daily nutrition. 30 tablets.', category: ProductCategory.SUPPLEMENTS, priceAmount: 35000, requiresPrescription: false, isFeatured: true },
    { id: 'prod-016', name: 'Ashwagandha Capsules', description: 'Stress support and vitality. Pack of 60.', category: ProductCategory.AYURVEDIC, priceAmount: 28000, requiresPrescription: false, isFeatured: false },
    { id: 'prod-017', name: 'Chyawanprash 500g', description: 'Traditional Ayurvedic immunity booster.', category: ProductCategory.AYURVEDIC, priceAmount: 32000, requiresPrescription: false, isFeatured: false },
    { id: 'prod-018', name: 'Triphala Churna 100g', description: 'Digestive health and detox powder.', category: ProductCategory.AYURVEDIC, priceAmount: 12000, requiresPrescription: false, isFeatured: false },
    { id: 'prod-019', name: 'Digital Thermometer', description: 'Fast and accurate body temperature measurement.', category: ProductCategory.HEALTH_DEVICES, priceAmount: 19900, requiresPrescription: false, isFeatured: true },
    { id: 'prod-020', name: 'Blood Pressure Monitor', description: 'Automatic digital BP monitor for home use.', category: ProductCategory.HEALTH_DEVICES, priceAmount: 185000, requiresPrescription: false, isFeatured: false },
    { id: 'prod-021', name: 'Pulse Oximeter', description: 'Finger pulse oximeter for SpO2 monitoring.', category: ProductCategory.HEALTH_DEVICES, priceAmount: 89900, requiresPrescription: false, isFeatured: false },
    { id: 'prod-022', name: 'Glucometer Starter Kit', description: 'Blood glucose monitor kit with strips.', category: ProductCategory.HEALTH_DEVICES, priceAmount: 125000, requiresPrescription: false, isFeatured: false },
    { id: 'prod-023', name: 'First Aid Kit', description: 'Complete first aid kit with essentials.', category: ProductCategory.FIRST_AID, priceAmount: 39900, requiresPrescription: false, isFeatured: false },
    { id: 'prod-024', name: 'Antiseptic Solution 100ml', description: 'Antiseptic liquid for wound cleaning.', category: ProductCategory.FIRST_AID, priceAmount: 8500, requiresPrescription: false, isFeatured: false },
    { id: 'prod-025', name: 'Elastic Crepe Bandage', description: 'Support bandage for sprains and strains.', category: ProductCategory.FIRST_AID, priceAmount: 9500, requiresPrescription: false, isFeatured: false },
    { id: 'prod-026', name: 'Baby Diapers Medium', description: 'Soft and absorbent diapers. Pack of 44.', category: ProductCategory.BABY_CARE, priceAmount: 79900, requiresPrescription: false, isFeatured: false },
    { id: 'prod-027', name: 'Baby Lotion 200ml', description: 'Gentle moisturizing lotion for baby skin.', category: ProductCategory.BABY_CARE, priceAmount: 22000, requiresPrescription: false, isFeatured: false },
    { id: 'prod-028', name: 'Baby Rash Cream', description: 'Soothing cream for diaper rash care.', category: ProductCategory.BABY_CARE, priceAmount: 17900, requiresPrescription: false, isFeatured: false },
    { id: 'prod-029', name: 'Sunscreen SPF 50', description: 'Broad-spectrum sun protection. 100ml.', category: ProductCategory.PERSONAL_CARE, priceAmount: 35000, requiresPrescription: false, isFeatured: false },
    { id: 'prod-030', name: 'Hand Sanitizer 500ml', description: '70% alcohol-based hand sanitizer.', category: ProductCategory.PERSONAL_CARE, priceAmount: 15000, requiresPrescription: false, isFeatured: false },
    { id: 'prod-031', name: 'Hydrating Face Wash', description: 'Daily gentle face wash for dry skin.', category: ProductCategory.PERSONAL_CARE, priceAmount: 24000, requiresPrescription: false, isFeatured: false },
    { id: 'prod-032', name: 'Omeprazole 20mg', description: 'Acid reflux and GERD support. Pack of 14.', category: ProductCategory.PRESCRIPTION, priceAmount: 8500, requiresPrescription: true, isFeatured: false },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        category: product.category,
        priceAmount: product.priceAmount,
        priceCurrency: 'INR',
        requiresPrescription: product.requiresPrescription,
        isFeatured: product.isFeatured,
        isActive: true,
      },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        priceAmount: product.priceAmount,
        priceCurrency: 'INR',
        requiresPrescription: product.requiresPrescription,
        isFeatured: product.isFeatured,
        isActive: true,
      },
    });
    console.log(`   ✓ ${created.name} (${created.category})`);
  }

  // ==========================================================================
  // Seed Promotions
  // ==========================================================================
  console.log('\n🎯 Creating promotions...');

  const promotions = [
    {
      id: 'promo-001',
      title: '20% off on vitamins',
      description: 'Save on immunity and wellness supplements.',
      imageUrl: '/assets/promotions/vitamins.svg',
      discountPercent: 20,
      active: true,
      expiresAt: new Date('2026-12-31T00:00:00.000Z'),
    },
    {
      id: 'promo-002',
      title: 'Diabetes care essentials',
      description: 'Bundles for sugar management and daily monitoring.',
      imageUrl: '/assets/promotions/diabetes.svg',
      discountPercent: 15,
      active: true,
      expiresAt: new Date('2026-11-30T00:00:00.000Z'),
    },
    {
      id: 'promo-003',
      title: 'Winter immunity combo',
      description: 'Top picks for cough, cold and flu season.',
      imageUrl: '/assets/promotions/immunity.svg',
      discountPercent: 25,
      active: true,
      expiresAt: new Date('2026-10-31T00:00:00.000Z'),
    },
  ];

  for (const promotion of promotions) {
    const created = await prisma.promotion.upsert({
      where: { id: promotion.id },
      update: {
        title: promotion.title,
        description: promotion.description,
        imageUrl: promotion.imageUrl,
        discountPercent: promotion.discountPercent,
        active: promotion.active,
        expiresAt: promotion.expiresAt,
      },
      create: promotion,
    });
    console.log(`   ✓ ${created.title}`);
  }

  // ==========================================================================
  // Seed Health Articles
  // ==========================================================================
  console.log('\n📰 Creating health articles...');

  const articles = [
    {
      id: 'article-001',
      title: 'How to manage diabetes',
      slug: 'how-to-manage-diabetes',
      summary: 'Daily routines and food choices that help keep blood sugar stable.',
      coverImage: '/assets/articles/diabetes-care.svg',
      content:
        '# How to manage diabetes\n\nMaintaining stable blood sugar levels starts with regular meals, exercise, and medication adherence.\n\n- Track your sugar levels\n- Stay active for at least 30 minutes daily\n- Follow your doctor-prescribed treatment',
      publishedAt: new Date('2026-02-01T09:00:00.000Z'),
    },
    {
      id: 'article-002',
      title: 'Best supplements for immunity',
      slug: 'best-supplements-for-immunity',
      summary: 'Vitamin C, Zinc, and daily hydration for immune support.',
      coverImage: '/assets/articles/immunity-supplements.svg',
      content:
        '# Best supplements for immunity\n\nA balanced diet is primary, but supplements can fill nutritional gaps.\n\n- Vitamin C\n- Vitamin D3\n- Zinc',
      publishedAt: new Date('2026-02-05T09:00:00.000Z'),
    },
    {
      id: 'article-003',
      title: 'Cold and flu prevention',
      slug: 'cold-and-flu-prevention',
      summary: 'Practical prevention steps for seasonal infections.',
      coverImage: '/assets/articles/cold-flu.svg',
      content:
        '# Cold and flu prevention\n\nGood hygiene and adequate sleep can significantly lower infection risk.\n\n- Wash hands regularly\n- Sleep 7-8 hours\n- Stay hydrated',
      publishedAt: new Date('2026-02-10T09:00:00.000Z'),
    },
    {
      id: 'article-004',
      title: 'Understanding blood pressure',
      slug: 'understanding-blood-pressure',
      summary: 'Know your BP numbers and how to keep them in range.',
      coverImage: '/assets/articles/blood-pressure.svg',
      content:
        '# Understanding blood pressure\n\nBlood pressure is a key marker for cardiovascular health.\n\n- Monitor regularly\n- Reduce excess salt\n- Follow prescribed medication',
      publishedAt: new Date('2026-02-14T09:00:00.000Z'),
    },
    {
      id: 'article-005',
      title: 'Vitamin D deficiency signs',
      slug: 'vitamin-d-deficiency-signs',
      summary: 'Common symptoms and when to consult a doctor.',
      coverImage: '/assets/articles/vitamin-d.svg',
      content:
        '# Vitamin D deficiency signs\n\nLow vitamin D can affect mood, immunity, and bone strength.\n\n- Persistent fatigue\n- Muscle weakness\n- Frequent illness',
      publishedAt: new Date('2026-02-18T09:00:00.000Z'),
    },
  ];

  for (const article of articles) {
    const created = await prisma.healthArticle.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        summary: article.summary,
        coverImage: article.coverImage,
        content: article.content,
        publishedAt: article.publishedAt,
      },
      create: article,
    });
    console.log(`   ✓ ${created.title}`);
  }

  // Optional seed subscriber to verify newsletter list quickly in dev.
  await prisma.newsletterSubscriber.upsert({
    where: { email: 'demo@jantapharmacy.com' },
    update: { status: NewsletterStatus.ACTIVE },
    create: {
      email: 'demo@jantapharmacy.com',
      status: NewsletterStatus.ACTIVE,
    },
  });

  // ==========================================================================
  // Summary
  // ==========================================================================
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const promotionCount = await prisma.promotion.count();
  const articleCount = await prisma.healthArticle.count();
  const newsletterCount = await prisma.newsletterSubscriber.count();

  console.log('\n✅ Seeding complete!');
  console.log(`   Users: ${userCount}`);
  console.log(`   Products: ${productCount}`);
  console.log(`   Promotions: ${promotionCount}`);
  console.log(`   Articles: ${articleCount}`);
  console.log(`   Newsletter subscribers: ${newsletterCount}`);
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

