import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  const universities = [
    { name: 'University of Nairobi', code: 'UON', location: 'Nairobi' },
    { name: 'Kenyatta University', code: 'KU', location: 'Nairobi' },
    { name: 'Jomo Kenyatta University', code: 'JKUAT', location: 'Nairobi' },
    { name: 'Egerton University', code: 'EGERTON', location: 'Njoro' },
    { name: 'Moi University', code: 'MOI', location: 'Eldoret' },
    { name: 'Dedan Kimathi University of Technology', code: 'DKUT', location: 'Nyeri' },
  ];

  for (const university of universities) {
    await prisma.university.upsert({
      where: { code: university.code },
      update: {},
      create: university,
    });
  }

  const sportNames = [
    { name: 'Football', category: 'Team Sport' },
    { name: 'Basketball', category: 'Team Sport' },
    { name: 'Athletics', category: 'Track & Field' },
    { name: 'Volleyball', category: 'Team Sport' },
  ];

  for (const sport of sportNames) {
    await prisma.sport.upsert({
      where: { name: sport.name },
      update: {},
      create: sport,
    });
  }

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@kusf.org' },
    update: {},
    create: {
      name: 'KUSF Super Admin',
      email: 'admin@kusf.org',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  const university = await prisma.university.findUnique({ where: { code: 'UON' } });
  const football = await prisma.sport.findUnique({ where: { name: 'Football' } });
  const coach = await prisma.user.upsert({
    where: { email: 'coach@uon.ac.ke' },
    update: {},
    create: {
      name: 'Coach Maina',
      email: 'coach@uon.ac.ke',
      passwordHash,
      role: 'COACH',
      universityId: university?.id,
    },
  });

  const athleteUser = await prisma.user.upsert({
    where: { email: 'athlete@uon.ac.ke' },
    update: {},
    create: {
      name: 'John Otieno',
      email: 'athlete@uon.ac.ke',
      passwordHash,
      role: 'ATHLETE',
      universityId: university?.id,
    },
  });

  const athlete = await prisma.athlete.upsert({
    where: { userId: athleteUser.id },
    update: {},
    create: {
      userId: athleteUser.id,
      fullName: athleteUser.name,
      dateOfBirth: new Date('2005-02-14'),
      gender: 'Male',
      nationality: 'Kenyan',
      phone: '+254700000001',
      universityId: university!.id,
      sportId: football!.id,
      eligibilityStatus: 'APPROVED',
      verificationStatus: 'VERIFIED',
    },
  });

  const team = await prisma.team.upsert({
    where: { id: 'team-demo' },
    update: {},
    create: {
      id: 'team-demo',
      name: 'UON Falcons',
      universityId: university!.id,
      sportId: football!.id,
      coachId: coach.id,
    },
  });

  await prisma.teamAthlete.upsert({
    where: {
      teamId_athleteId: {
        teamId: team.id,
        athleteId: athlete.id,
      },
    },
    update: {},
    create: {
      teamId: team.id,
      athleteId: athlete.id,
    },
  });

  const competition = await prisma.competition.upsert({
    where: { id: 'competition-demo' },
    update: {},
    create: {
      id: 'competition-demo',
      name: 'KUSF League 2026',
      date: new Date('2026-09-10'),
      location: 'Nairobi',
    },
  });

  await prisma.competitionTeam.upsert({
    where: {
      competitionId_teamId: {
        competitionId: competition.id,
        teamId: team.id,
      },
    },
    update: {},
    create: {
      competitionId: competition.id,
      teamId: team.id,
    },
  });

  await prisma.eligibilityRecord.create({
    data: {
      athleteId: athlete.id,
      academicStatus: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      approvalHistory: [{ reviewer: superAdmin.email, action: 'APPROVED', status: 'APPROVED' }],
    },
  });

  await prisma.document.create({
    data: {
      athleteId: athlete.id,
      documentType: 'ID',
      fileUrl: 'https://example.com/id.pdf',
      verificationStatus: 'VERIFIED',
    },
  });

  // ---------- DKUT (Dedan Kimathi University) test entries ----------
  const dkutUniversity = await prisma.university.findUnique({ where: { code: 'DKUT' } });
  if (dkutUniversity) {
    const dkutSportsOfficer = await prisma.user.upsert({
      where: { email: 'sports.officer@dkut.ac.ke' },
      update: {},
      create: {
        name: 'DKUT Sports Officer',
        email: 'sports.officer@dkut.ac.ke',
        passwordHash,
        role: 'UNIVERSITY_ADMIN',
        universityId: dkutUniversity.id,
      },
    });

    const dkutAdmin = await prisma.user.upsert({
      where: { email: 'admin@dkut.ac.ke' },
      update: {},
      create: {
        name: 'DKUT Admin',
        email: 'admin@dkut.ac.ke',
        passwordHash,
        role: 'UNIVERSITY_ADMIN',
        universityId: dkutUniversity.id,
      },
    });

    const coachDkut = await prisma.user.upsert({
      where: { email: 'coach@dkut.ac.ke' },
      update: {},
      create: {
        name: 'Coach Wambui',
        email: 'coach@dkut.ac.ke',
        passwordHash,
        role: 'COACH',
        universityId: dkutUniversity.id,
      },
    });

    const captainUser = await prisma.user.upsert({
      where: { email: 'captain@dkut.ac.ke' },
      update: {},
      create: {
        name: 'Captain Kibet',
        email: 'captain@dkut.ac.ke',
        passwordHash,
        role: 'ATHLETE',
        universityId: dkutUniversity.id,
      },
    });

    const playerA = await prisma.user.upsert({
      where: { email: 'player1@dkut.ac.ke' },
      update: {},
      create: {
        name: 'Player A',
        email: 'player1@dkut.ac.ke',
        passwordHash,
        role: 'ATHLETE',
        universityId: dkutUniversity.id,
      },
    });

    const playerB = await prisma.user.upsert({
      where: { email: 'player2@dkut.ac.ke' },
      update: {},
      create: {
        name: 'Player B',
        email: 'player2@dkut.ac.ke',
        passwordHash,
        role: 'ATHLETE',
        universityId: dkutUniversity.id,
      },
    });

    const footballSport = await prisma.sport.findUnique({ where: { name: 'Football' } });

    const captainAthlete = await prisma.athlete.upsert({
      where: { userId: captainUser.id },
      update: {},
      create: {
        userId: captainUser.id,
        fullName: captainUser.name,
        dateOfBirth: new Date('2004-05-20'),
        gender: 'Male',
        nationality: 'Kenyan',
        phone: '+254700000010',
        universityId: dkutUniversity.id,
        sportId: footballSport!.id,
        eligibilityStatus: 'APPROVED',
        verificationStatus: 'VERIFIED',
      },
    });

    const athleteA = await prisma.athlete.upsert({
      where: { userId: playerA.id },
      update: {},
      create: {
        userId: playerA.id,
        fullName: playerA.name,
        dateOfBirth: new Date('2005-03-11'),
        gender: 'Female',
        nationality: 'Kenyan',
        phone: '+254700000011',
        universityId: dkutUniversity.id,
        sportId: footballSport!.id,
        eligibilityStatus: 'PENDING',
        verificationStatus: 'PENDING',
      },
    });

    const athleteB = await prisma.athlete.upsert({
      where: { userId: playerB.id },
      update: {},
      create: {
        userId: playerB.id,
        fullName: playerB.name,
        dateOfBirth: new Date('2005-07-02'),
        gender: 'Male',
        nationality: 'Kenyan',
        phone: '+254700000012',
        universityId: dkutUniversity.id,
        sportId: footballSport!.id,
        eligibilityStatus: 'PENDING',
        verificationStatus: 'PENDING',
      },
    });

    const teamDkut = await prisma.team.upsert({
      where: { id: 'team-dkut-1' },
      update: {},
      create: {
        id: 'team-dkut-1',
        name: 'DKUT Eagles',
        universityId: dkutUniversity.id,
        sportId: footballSport!.id,
        coachId: coachDkut.id,
      },
    });

    // add players to team (captain first)
    await prisma.teamAthlete.upsert({
      where: {
        teamId_athleteId: {
          teamId: teamDkut.id,
          athleteId: captainAthlete.id,
        },
      },
      update: {},
      create: {
        teamId: teamDkut.id,
        athleteId: captainAthlete.id,
      },
    });

    await prisma.teamAthlete.upsert({
      where: {
        teamId_athleteId: {
          teamId: teamDkut.id,
          athleteId: athleteA.id,
        },
      },
      update: {},
      create: {
        teamId: teamDkut.id,
        athleteId: athleteA.id,
      },
    });

    await prisma.teamAthlete.upsert({
      where: {
        teamId_athleteId: {
          teamId: teamDkut.id,
          athleteId: athleteB.id,
        },
      },
      update: {},
      create: {
        teamId: teamDkut.id,
        athleteId: athleteB.id,
      },
    });

    // mark eligibility for captain
    await prisma.eligibilityRecord.create({
      data: {
        athleteId: captainAthlete.id,
        academicStatus: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        approvalHistory: [{ reviewer: dkutSportsOfficer.email, action: 'APPROVED', status: 'APPROVED' }],
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
