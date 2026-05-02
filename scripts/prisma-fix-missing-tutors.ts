import { prisma } from '../src/lib/prisma';

async function createMissingTutorRecords() {
  console.log('🔍 Checking for TUTOR users without Tutor records...\n');

  // Find all users with TUTOR role that don't have a Tutor record
  const tutorUsersWithoutTutor = await prisma.user.findMany({
    where: {
      role: 'TUTOR',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  // Filter those without Tutor record
  const usersWithTutor = await prisma.tutor.findMany({
    where: {
      userId: { in: tutorUsersWithoutTutor.map(u => u.id) }
    },
    select: { userId: true }
  });
  const tutorUserIds = new Set(usersWithTutor.map(t => t.userId));
  
  const missingTutorUsers = tutorUsersWithoutTutor.filter(u => !tutorUserIds.has(u.id));

  console.log(`📊 Found ${missingTutorUsers.length} TUTOR users missing Tutor records:\n`);
  
  for (const user of missingTutorUsers) {
    console.log(`  - ${user.name} (${user.email}) - User ID: ${user.id}`);
  }

  if (missingTutorUsers.length === 0) {
    console.log('✅ No missing Tutor records found!');
    return;
  }

  console.log('\n✨ Creating missing Tutor records...\n');

  for (const user of missingTutorUsers) {
    try {
      const tutor = await prisma.tutor.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          name: user.name,
          email: user.email,
          bio: '',
        },
      });
      console.log(`  ✅ Created Tutor: ${tutor.name} (ID: ${tutor.id}) for User ${user.id}`);
    } catch (error) {
      console.error(`  ❌ Failed to create Tutor for User ${user.id}:`, error);
    }
  }

  console.log('\n✅ Migration complete!');
  console.log('\nNext steps:');
  console.log('1. Verify with: npx prisma studio');
  console.log('2. Test creating availability again');
}

// Run the script
createMissingTutorRecords()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });