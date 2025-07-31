// prisma/seed.ts
import { PrismaClient, UserRole, UserStatus, ApplicationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TracceAqua database...');

  // Clean existing data in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...');
    await prisma.adminAction.deleteMany();
    await prisma.roleApplication.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.conservationRecord.deleteMany();
    await prisma.supplyChainRecord.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create Admin User
  console.log('👑 Creating admin user...');
  const adminUser = await prisma.user.create({
    data: {
      address: '0x1234567890123456789012345678901234567890',
      email: 'admin@tracceaqua.com',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      profile: {
        create: {
          firstName: 'System',
          lastName: 'Administrator',
          organization: 'TracceAqua',
          bio: 'System administrator for TracceAqua platform',
          location: 'Lagos, Nigeria',
        },
      },
    },
    include: { profile: true },
  });
  console.log(`✅ Admin user created: ${adminUser.address}`);

  // Create Test Consumer Users
  console.log('👥 Creating consumer users...');
  const consumerUsers = await Promise.all([
    prisma.user.create({
      data: {
        address: '0x2234567890123456789012345678901234567890',
        email: 'consumer1@example.com',
        role: UserRole.CONSUMER,
        status: UserStatus.ACTIVE,
        profile: {
          create: {
            firstName: 'John',
            lastName: 'Consumer',
            bio: 'Seafood enthusiast who loves tracing products',
            location: 'Lagos, Nigeria',
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        address: '0x3234567890123456789012345678901234567890',
        email: 'consumer2@example.com',
        role: UserRole.CONSUMER,
        status: UserStatus.ACTIVE,
        profile: {
          create: {
            firstName: 'Jane',
            lastName: 'Smith',
            bio: 'Health-conscious consumer interested in sustainable seafood',
            location: 'Abuja, Nigeria',
          },
        },
      },
    }),
  ]);
  console.log(`✅ Created ${consumerUsers.length} consumer users`);

  // Create Test Professional Users
  console.log('🎣 Creating professional users...');
  const professionalUsers = await Promise.all([
    prisma.user.create({
      data: {
        address: '0x4234567890123456789012345678901234567890',
        email: 'fisherman@example.com',
        role: UserRole.FISHERMAN,
        status: UserStatus.ACTIVE,
        profile: {
          create: {
            firstName: 'Ahmed',
            lastName: 'Hassan',
            organization: 'Lagos Bay Fishermen Cooperative',
            licenseNumber: 'FIS-2024-001',
            bio: 'Experienced fisherman specializing in sustainable fishing practices',
            location: 'Lagos, Nigeria',
            phoneNumber: '+234-801-234-5678',
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        address: '0x5234567890123456789012345678901234567890',
        email: 'farmer@example.com',
        role: UserRole.FARMER,
        status: UserStatus.ACTIVE,
        profile: {
          create: {
            firstName: 'Fatima',
            lastName: 'Okonkwo',
            organization: 'Nigerian Aquaculture Farms Ltd',
            licenseNumber: 'AQF-2024-002',
            bio: 'Aquaculture specialist with 10+ years experience in shrimp farming',
            location: 'Delta State, Nigeria',
            phoneNumber: '+234-802-345-6789',
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        address: '0x6234567890123456789012345678901234567890',
        email: 'researcher@example.com',
        role: UserRole.RESEARCHER,
        status: UserStatus.ACTIVE,
        profile: {
          create: {
            firstName: 'Dr. Emmanuel',
            lastName: 'Adebayo',
            organization: 'University of Lagos Marine Science Department',
            licenseNumber: 'RES-2024-003',
            bio: 'Marine biologist researching sustainable shellfish conservation',
            location: 'Lagos, Nigeria',
            phoneNumber: '+234-803-456-7890',
          },
        },
      },
    }),
  ]);
  console.log(`✅ Created ${professionalUsers.length} professional users`);

  // Create Users with Pending Role Applications
  console.log('⏳ Creating users with pending applications...');
  const pendingUser = await prisma.user.create({
    data: {
      address: '0x7234567890123456789012345678901234567890',
      email: 'pending@example.com',
      role: UserRole.PENDING_UPGRADE,
      status: UserStatus.ACTIVE,
      profile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          organization: 'Johnson Seafood Processing Co.',
          bio: 'Seafood processor looking to join the platform',
          location: 'Rivers State, Nigeria',
          phoneNumber: '+234-804-567-8901',
        },
      },
    },
  });

  // Create role application for pending user
  await prisma.roleApplication.create({
    data: {
      userId: pendingUser.id,
      requestedRole: UserRole.PROCESSOR,
      status: ApplicationStatus.PENDING,
      organization: 'Johnson Seafood Processing Co.',
      licenseNumber: 'PROC-2024-PENDING',
      businessType: 'Seafood Processing',
      experience: '5 years',
      motivation: 'Want to contribute to seafood traceability and quality assurance',
      documents: ['QmExampleIPFSHash1', 'QmExampleIPFSHash2'], // Mock IPFS hashes
    },
  });
  console.log('✅ Created user with pending role application');

  // Create some admin actions for audit trail
  console.log('📋 Creating admin action history...');
  await Promise.all([
    prisma.adminAction.create({
      data: {
        adminId: adminUser.id,
        targetId: professionalUsers[0].id,
        action: 'APPROVE_ROLE',
        description: 'Approved fisherman role application after document verification',
        metadata: {
          previousRole: 'CONSUMER',
          newRole: 'FISHERMAN',
          documents: ['license.pdf', 'certificate.pdf'],
        },
      },
    }),
    prisma.adminAction.create({
      data: {
        adminId: adminUser.id,
        targetId: professionalUsers[1].id,
        action: 'APPROVE_ROLE',
        description: 'Approved farmer role application with aquaculture license',
        metadata: {
          previousRole: 'CONSUMER',
          newRole: 'FARMER',
          licenseNumber: 'AQF-2024-002',
        },
      },
    }),
  ]);
  console.log('✅ Created admin action history');

  // Summary
  const totalUsers = await prisma.user.count();
  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: true,
  });

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📊 Database Summary:');
  console.log(`📋 Total Users: ${totalUsers}`);
  console.log('👥 Users by Role:');
  usersByRole.forEach((group) => {
    console.log(`   ${group.role}: ${group._count} users`);
  });
  console.log('\n🔑 Test Accounts:');
  console.log('   Admin: admin@tracceaqua.com (0x1234...7890)');
  console.log('   Consumer: consumer1@example.com (0x2234...7890)');
  console.log('   Fisherman: fisherman@example.com (0x4234...7890)');
  console.log('   Farmer: farmer@example.com (0x5234...7890)');
  console.log('   Researcher: researcher@example.com (0x6234...7890)');
  console.log('   Pending User: pending@example.com (0x7234...7890)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });