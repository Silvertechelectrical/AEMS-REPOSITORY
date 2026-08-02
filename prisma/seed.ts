import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require',
  },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
    try {
      await prisma.university.upsert({
        where: { code: university.code },
        update: {},
        create: university,
      });
    } catch (e) {
      console.warn('Prisma upsert university failed, falling back to SQL:', university.code, e?.message || e);
      await pool.query(
        `INSERT INTO universities (name, code, location, created_at, updated_at)
         VALUES ($1,$2,$3,now(),now())
         ON CONFLICT (code) DO NOTHING`,
        [university.name, university.code, university.location]
      );
    }
  }

  const sportNames = [
    { name: 'Football', category: 'Team Sport' },
    { name: 'Basketball', category: 'Team Sport' },
    { name: 'Athletics', category: 'Track & Field' },
    { name: 'Volleyball', category: 'Team Sport' },
  ];

  for (const sport of sportNames) {
    try {
      await prisma.sport.upsert({
        where: { name: sport.name },
        update: {},
        create: sport,
      });
    } catch (e) {
      console.warn('Prisma upsert sport failed, falling back to SQL:', sport.name, e?.message || e);
      await pool.query(
        `INSERT INTO sports (name, category, created_at, updated_at)
         VALUES ($1,$2,now(),now())
         ON CONFLICT (name) DO NOTHING`,
        [sport.name, sport.category]
      );
    }
  }

  let superAdmin: any;
  try {
    superAdmin = await prisma.user.upsert({
      where: { email: 'silvertech3l3ctrical@gmail.com' },
      update: {
        passwordHash,
        role: 'SUPER_ADMIN',
        approved: true,
      },
      create: {
        name: 'KUSF Super Admin',
        email: 'silvertech3l3ctrical@gmail.com',
        passwordHash,
        role: 'SUPER_ADMIN',
        approved: true,
      },
    });
  } catch (e) {
    console.warn('Prisma upsert superAdmin failed, falling back to SQL:', e?.message || e);
    const r = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
       VALUES ($1,$2,$3,$4,now(),now())
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING *`,
      ['KUSF Super Admin', 'admin@kusf.org', passwordHash, 'SUPER_ADMIN']
    );
    superAdmin = r.rows[0];
  }

  const university = await prisma.university.findUnique({ where: { code: 'UON' } });
  const football = await prisma.sport.findUnique({ where: { name: 'Football' } });
  let coach: any;
  try {
    coach = await prisma.user.upsert({
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
  } catch (e) {
    console.warn('Prisma upsert coach failed, falling back to SQL:', e?.message || e);
    const r = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, university_id, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,now(),now())
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING *`,
      ['Coach Maina', 'coach@uon.ac.ke', passwordHash, 'COACH', university?.id]
    );
    coach = r.rows[0];
  }

  let athleteUser: any;
  try {
    athleteUser = await prisma.user.upsert({
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
  } catch (e) {
    console.warn('Prisma upsert athleteUser failed, falling back to SQL:', e?.message || e);
    const r = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, university_id, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,now(),now())
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING *`,
      ['John Otieno', 'athlete@uon.ac.ke', passwordHash, 'ATHLETE', university?.id]
    );
    athleteUser = r.rows[0];
  }

  let athlete: any;
  try {
    athlete = await prisma.athlete.upsert({
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
  } catch (e) {
    console.warn('Prisma upsert for athlete failed, falling back to raw SQL insert:', e?.message || e);
    const insertRes = await pool.query(
      `INSERT INTO athletes (user_id, full_name, date_of_birth, gender, nationality, phone, university_id, sport_id, eligibility_status, verification_status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now(),now())
       ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name RETURNING *`,
      [athleteUser.id, athleteUser.name, new Date('2005-02-14'), 'Male', 'Kenyan', '+254700000001', university!.id, football!.id, 'APPROVED', 'VERIFIED']
    );
    athlete = insertRes.rows[0];
  }

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

  // --- create realistic university students data for each university ---
  const studentsPerUniversity = Number(process.env.SEED_STUDENTS_PER_UNI || '50');

  const dbUniversities = await prisma.university.findMany();
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
  const lastNames = ['Kimani', 'Mwangi', 'Odhiambo', 'Njoroge', 'Kiptoo', 'Ochieng', 'Wanjiru', 'Mutua', 'Ndegwa', 'Maina', 'Mworia', 'Kilonzo', 'Kamau', 'Otieno', 'Muriuki'];

  for (const uni of dbUniversities) {
    const createdStudents: { id: string }[] = [];

    for (let i = 0; i < studentsPerUniversity; i++) {
      const given = firstNames[Math.floor(Math.random() * firstNames.length)];
      const family = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${given} ${family}`;
      const year = 1998 + Math.floor(Math.random() * 9); // 1998 - 2006
      const month = 1 + Math.floor(Math.random() * 12);
      const day = 1 + Math.floor(Math.random() * 28);
      const dateOfBirth = new Date(year, month - 1, day);
      const uniStudentId = `${uni.code}-S${10000 + i}`;
      const regNo = `${uni.code}-${20000 + i}`;
      const statuses = ['ACTIVE', 'GRADUATED', 'SUSPENDED', 'EXPELLED', 'WITHDRAWN', 'PENDING'];
      const enrollmentStatus = statuses[Math.floor(Math.random() * statuses.length)];

      const us = await prisma.universityStudent.upsert({
        where: { universityStudentId: uniStudentId },
        update: {
          fullName,
          dateOfBirth,
          enrollmentStatus,
          updatedAt: new Date(),
        },
        create: {
          universityId: uni.id,
          universityStudentId: uniStudentId,
          registrationNumber: regNo,
          fullName,
          dateOfBirth,
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          admissionDate: new Date(year + 10, 0, 1),
          expectedGraduationDate: new Date(year + 14, 5, 1),
          enrollmentStatus,
          academicStatus: 'GOOD',
          graduationStatus: enrollmentStatus === 'GRADUATED' ? 'COMPLETED' : 'IN_PROGRESS',
          suspensionStatus: enrollmentStatus === 'SUSPENDED' ? 'ACTIVE' : 'NONE',
          expulsionStatus: enrollmentStatus === 'EXPELLED' ? 'ACTIVE' : 'NONE',
          disciplinaryStatus: 'NONE',
        },
      });

      createdStudents.push({ id: us.id });
    }

    // Link a small number of existing athletes at this university to randomly-picked university student records
    const athletesAtUni = await prisma.athlete.findMany({ where: { universityId: uni.id } });
    for (let idx = 0; idx < Math.min(athletesAtUni.length, Math.max(1, Math.floor(createdStudents.length * 0.03))); idx++) {
      const a = athletesAtUni[idx];
      const pick = createdStudents[Math.floor(Math.random() * createdStudents.length)];
      if (a && pick) {
        await prisma.athlete.update({ where: { id: a.id }, data: { universityStudentId: pick.id } });
      }
    }
  }

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

  // Optionally create Supabase Auth users when enabled (useful for environments where Auth is managed here)
  if (process.env.SEED_CREATE_SUPABASE_USERS === 'true') {
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

    if (supabaseUrl && serviceRole) {
      const sb = createClient(supabaseUrl, serviceRole);

      const seedUsers = await prisma.user.findMany({ select: { email: true, name: true, role: true } });

      for (const u of seedUsers) {
        try {
          const { data: list } = await sb.auth.admin.listUsers({ filter: `email.eq.${u.email}` } as any);
          if (list && (list as any).users && (list as any).users.length > 0) {
            continue;
          }

          const password = 'Admin@123';
          const { data, error } = await sb.auth.admin.createUser({
            email: u.email,
            password,
            user_metadata: { name: u.name, role: u.role },
            email_confirm: true,
          } as any);

          if (error) {
            console.warn('Failed to create supabase user', u.email, error.message);
          } else {
            console.log('Supabase user created', u.email);
          }
        } catch (e: any) {
          console.warn('Supabase admin error for', u.email, e?.message || e);
        }
      }
    } else {
      console.warn('SEED_CREATE_SUPABASE_USERS enabled but Supabase URL or service key missing.');
    }
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
