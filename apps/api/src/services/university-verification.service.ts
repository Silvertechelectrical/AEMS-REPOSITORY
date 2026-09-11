import { evaluateEligibility } from './eligibility.service.js';
import { prisma } from '../lib/prisma.js';
import { getSupabase, hasSupabase } from '../lib/supabase.js';

export type UniversityStudentRecord = {
  id?: string;
  studentNumber: string;
  universityCode: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  photoUrl: string;
  enrollmentStatus: 'ACTIVE' | 'GRADUATED' | 'SUSPENDED' | 'EXPELLED' | 'WITHDRAWN';
  academicStatus: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
  disciplinaryStatus: 'CLEAR' | 'SUSPENDED' | 'EXPELLED';
  isSuspended: boolean;
  isExpelled: boolean;
};

type SupabaseUniversityStudentRow = {
  id?: string;
  university_student_id?: string;
  student_number?: string;
  university_code?: string;
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  photo_url?: string;
  enrollment_status?: string;
  academic_status?: string;
  disciplinary_status?: string;
  suspension_status?: string;
  expulsion_status?: string;
  registration_number?: string;
};

const SUPABASE_STUDENT_TABLE = process.env.SUPABASE_STUDENT_TABLE ?? 'university_students';

const normalizeSupabaseStudent = (row: SupabaseUniversityStudentRow): UniversityStudentRecord => ({
  id: row.id,
  studentNumber: row.university_student_id ?? row.student_number ?? '',
  universityCode: row.university_code ?? '',
  name: row.full_name ?? '',
  dateOfBirth: row.date_of_birth ?? new Date().toISOString(),
  gender: row.gender ?? 'Unknown',
  photoUrl: row.photo_url ?? '',
  enrollmentStatus: (row.enrollment_status ?? 'ACTIVE') as UniversityStudentRecord['enrollmentStatus'],
  academicStatus: (row.academic_status ?? 'ACTIVE') as UniversityStudentRecord['academicStatus'],
  disciplinaryStatus: (row.disciplinary_status ?? 'CLEAR') as UniversityStudentRecord['disciplinaryStatus'],
  isSuspended: (row.suspension_status ?? 'NONE') === 'ACTIVE' || (row.disciplinary_status ?? 'CLEAR') === 'SUSPENDED',
  isExpelled: (row.expulsion_status ?? 'NONE') === 'ACTIVE' || (row.disciplinary_status ?? 'CLEAR') === 'EXPELLED',
});

const persistUniversityStudent = async (student: UniversityStudentRecord) => {
  const university = await prisma.university.findUnique({ where: { code: student.universityCode } });
  if (!university) {
    return null;
  }

  const persisted = await prisma.universityStudent.upsert({
    where: { universityStudentId: student.studentNumber },
    update: {
      universityId: university.id,
      fullName: student.name,
      dateOfBirth: new Date(student.dateOfBirth),
      gender: student.gender,
      photoUrl: student.photoUrl,
      enrollmentStatus: student.enrollmentStatus,
      academicStatus: student.academicStatus,
      disciplinaryStatus: student.disciplinaryStatus,
      suspensionStatus: student.isSuspended ? 'ACTIVE' : 'NONE',
      expulsionStatus: student.isExpelled ? 'ACTIVE' : 'NONE',
      updatedAt: new Date(),
    },
    create: {
      universityId: university.id,
      universityStudentId: student.studentNumber,
      registrationNumber: `${student.universityCode}-${Date.now()}`,
      fullName: student.name,
      dateOfBirth: new Date(student.dateOfBirth),
      gender: student.gender,
      photoUrl: student.photoUrl,
      admissionDate: new Date(),
      expectedGraduationDate: new Date(),
      actualGraduationDate: null,
      enrollmentStatus: student.enrollmentStatus,
      academicStatus: student.academicStatus,
      graduationStatus: student.enrollmentStatus === 'GRADUATED' ? 'COMPLETED' : 'IN_PROGRESS',
      suspensionStatus: student.isSuspended ? 'ACTIVE' : 'NONE',
      expulsionStatus: student.isExpelled ? 'ACTIVE' : 'NONE',
      disciplinaryStatus: student.disciplinaryStatus,
    },
    include: { university: true },
  });

  return persisted;
};

const querySupabaseStudent = async (studentNumber: string, universityCode: string) => {
  if (process.env.CI === 'true' || process.env.DISABLE_DATABASE === 'true' || !hasSupabase()) {
    return null;
  }

  try {
    const supabase = getSupabase();
    const query = `student_number.eq.${studentNumber},university_student_id.eq.${studentNumber}`;
    const { data, error } = await supabase
      .from(SUPABASE_STUDENT_TABLE)
      .select('*')
      .or(query)
      .eq('university_code', universityCode)
      .limit(1)
      .maybeSingle() as { data: SupabaseUniversityStudentRow | null; error: any };

    if (error) {
      console.warn('Supabase university student lookup failed:', error.message);
      return null;
    }

    if (!data) {
      return null;
    }

    return normalizeSupabaseStudent(data);
  } catch (error: any) {
    console.warn('Supabase verification lookup failed:', error?.message ?? error);
    return null;
  }
};

const simulatedUniversityStudents: UniversityStudentRecord[] = [
  {
    studentNumber: 'UON/CS/2024/001',
    universityCode: 'UON',
    name: 'John Otieno',
    dateOfBirth: '2004-03-14',
    gender: 'Male',
    photoUrl: 'https://example.com/photos/john-otieno.png',
    enrollmentStatus: 'ACTIVE',
    academicStatus: 'ACTIVE',
    disciplinaryStatus: 'CLEAR',
    isSuspended: false,
    isExpelled: false,
  },
  {
    studentNumber: 'UON/CS/2024/002',
    universityCode: 'UON',
    name: 'Peter Kamau',
    dateOfBirth: '1999-01-10',
    gender: 'Male',
    photoUrl: 'https://example.com/photos/peter-kamau.png',
    enrollmentStatus: 'ACTIVE',
    academicStatus: 'ACTIVE',
    disciplinaryStatus: 'CLEAR',
    isSuspended: false,
    isExpelled: false,
  },
  {
    studentNumber: 'UON/CS/2024/003',
    universityCode: 'UON',
    name: 'Mary Wanjiku',
    dateOfBirth: '2002-06-25',
    gender: 'Female',
    photoUrl: 'https://example.com/photos/mary-wanjiku.png',
    enrollmentStatus: 'GRADUATED',
    academicStatus: 'GRADUATED',
    disciplinaryStatus: 'CLEAR',
    isSuspended: false,
    isExpelled: false,
  },
  {
    studentNumber: 'UON/CS/2024/004',
    universityCode: 'UON',
    name: 'David Mwangi',
    dateOfBirth: '2003-02-19',
    gender: 'Male',
    photoUrl: 'https://example.com/photos/david-mwangi.png',
    enrollmentStatus: 'SUSPENDED',
    academicStatus: 'ACTIVE',
    disciplinaryStatus: 'SUSPENDED',
    isSuspended: true,
    isExpelled: false,
  },
  {
    studentNumber: 'UON/CS/2024/005',
    universityCode: 'UON',
    name: 'Brian Kamau',
    dateOfBirth: '2001-09-10',
    gender: 'Male',
    photoUrl: 'https://example.com/photos/brian-kamau.png',
    enrollmentStatus: 'EXPELLED',
    academicStatus: 'INACTIVE',
    disciplinaryStatus: 'EXPELLED',
    isSuspended: false,
    isExpelled: true,
  },
];

const getAge = (dateOfBirth: string | Date) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
};

const toVerificationRecord = (student: UniversityStudentRecord) => ({
  id: student.id,
  name: student.name,
  studentNumber: student.studentNumber,
  universityCode: student.universityCode,
  dateOfBirth: student.dateOfBirth,
  gender: student.gender,
  photoUrl: student.photoUrl,
  enrollmentStatus: student.enrollmentStatus,
  academicStatus: student.academicStatus,
  disciplinaryStatus: student.disciplinaryStatus,
});

const mapToEligibilityInput = (student: UniversityStudentRecord) => ({
  age: getAge(student.dateOfBirth),
  enrolled: student.enrollmentStatus === 'ACTIVE',
  activeAcademicStatus: student.academicStatus === 'ACTIVE',
  hasDisciplinarySuspension: student.isSuspended || student.disciplinaryStatus === 'SUSPENDED' || student.isExpelled,
  hasMultipleUniversities: false,
  competitionLimitReached: false,
});

export const verifyUniversityStudent = async (studentNumber: string, universityCode: string) => {
  let dbRecord: Awaited<ReturnType<typeof prisma.universityStudent.findFirst>> = null;
  let databaseUnavailable = process.env.DISABLE_DATABASE === 'true';

  try {
    if (databaseUnavailable) {
      throw new Error('Database disabled for this environment');
    }
    dbRecord = await prisma.universityStudent.findFirst({
      where: { universityStudentId: studentNumber, university: { code: universityCode } },
      include: { university: true },
    });
  } catch {
    databaseUnavailable = true;
  }

  let student: UniversityStudentRecord | null = null;

  const supabaseStudent = await querySupabaseStudent(studentNumber, universityCode);
  if (supabaseStudent) {
    const persisted = await persistUniversityStudent(supabaseStudent);
    if (!persisted) {
      return {
        verified: false,
        student: null,
        eligibility: {
          status: 'VERIFICATION_FAILED',
          reasons: ['University record not found.'],
        },
      };
    }

    dbRecord = persisted;
    student = {
      id: persisted.id,
      studentNumber: persisted.universityStudentId,
      universityCode: universityCode,
      name: persisted.fullName,
      dateOfBirth: persisted.dateOfBirth.toISOString(),
      gender: persisted.gender ?? 'Unknown',
      photoUrl: persisted.photoUrl ?? '',
      enrollmentStatus: persisted.enrollmentStatus as UniversityStudentRecord['enrollmentStatus'],
      academicStatus: persisted.academicStatus as UniversityStudentRecord['academicStatus'],
      disciplinaryStatus: persisted.disciplinaryStatus as UniversityStudentRecord['disciplinaryStatus'],
      isSuspended: persisted.suspensionStatus === 'ACTIVE' || persisted.disciplinaryStatus === 'SUSPENDED',
      isExpelled: persisted.expulsionStatus === 'ACTIVE' || persisted.disciplinaryStatus === 'EXPELLED',
    };
  } else if (dbRecord) {
    student = {
      id: dbRecord.id,
      studentNumber: dbRecord.universityStudentId,
      universityCode: universityCode,
      name: dbRecord.fullName,
      dateOfBirth: dbRecord.dateOfBirth.toISOString(),
      gender: dbRecord.gender ?? 'Unknown',
      photoUrl: dbRecord.photoUrl ?? '',
      enrollmentStatus: dbRecord.enrollmentStatus as UniversityStudentRecord['enrollmentStatus'],
      academicStatus: dbRecord.academicStatus as UniversityStudentRecord['academicStatus'],
      disciplinaryStatus: dbRecord.disciplinaryStatus as UniversityStudentRecord['disciplinaryStatus'],
      isSuspended: dbRecord.suspensionStatus === 'ACTIVE' || dbRecord.disciplinaryStatus === 'SUSPENDED',
      isExpelled: dbRecord.expulsionStatus === 'ACTIVE' || dbRecord.disciplinaryStatus === 'EXPELLED',
    };
  } else {
    const simulated = simulatedUniversityStudents.find(
      (entry) => entry.studentNumber === studentNumber && entry.universityCode === universityCode,
    );

    if (!simulated) {
      return {
        verified: false,
        student: null,
        eligibility: {
          status: 'VERIFICATION_FAILED',
          reasons: ['Student record not found.'],
        },
      };
    }

    if (databaseUnavailable) {
      student = simulated;
    } else {
      const university = await prisma.university.findUnique({ where: { code: universityCode } });
      if (!university) {
        return {
          verified: false,
          student: null,
          eligibility: {
            status: 'VERIFICATION_FAILED',
            reasons: ['University record not found.'],
          },
        };
      }

      const createdRecord = await prisma.universityStudent.upsert({
        where: { universityStudentId: simulated.studentNumber },
        update: {
          fullName: simulated.name,
          dateOfBirth: new Date(simulated.dateOfBirth),
          gender: simulated.gender,
          photoUrl: simulated.photoUrl,
          enrollmentStatus: simulated.enrollmentStatus,
          academicStatus: simulated.academicStatus,
          disciplinaryStatus: simulated.disciplinaryStatus,
          suspensionStatus: simulated.isSuspended ? 'ACTIVE' : 'NONE',
          expulsionStatus: simulated.isExpelled ? 'ACTIVE' : 'NONE',
          updatedAt: new Date(),
        },
        create: {
          universityId: university.id,
          universityStudentId: simulated.studentNumber,
          registrationNumber: `${simulated.universityCode}-${Date.now()}`,
          fullName: simulated.name,
          dateOfBirth: new Date(simulated.dateOfBirth),
          gender: simulated.gender,
          photoUrl: simulated.photoUrl,
          admissionDate: new Date(),
          expectedGraduationDate: new Date(),
          actualGraduationDate: null,
          enrollmentStatus: simulated.enrollmentStatus,
          academicStatus: simulated.academicStatus,
          graduationStatus: simulated.enrollmentStatus === 'GRADUATED' ? 'COMPLETED' : 'IN_PROGRESS',
          suspensionStatus: simulated.isSuspended ? 'ACTIVE' : 'NONE',
          expulsionStatus: simulated.isExpelled ? 'ACTIVE' : 'NONE',
          disciplinaryStatus: simulated.disciplinaryStatus,
        },
      });

      student = {
        id: createdRecord.id,
        studentNumber: createdRecord.universityStudentId,
        universityCode: universityCode,
        name: createdRecord.fullName,
        dateOfBirth: createdRecord.dateOfBirth.toISOString(),
        gender: createdRecord.gender ?? 'Unknown',
        photoUrl: createdRecord.photoUrl ?? '',
        enrollmentStatus: createdRecord.enrollmentStatus as UniversityStudentRecord['enrollmentStatus'],
        academicStatus: createdRecord.academicStatus as UniversityStudentRecord['academicStatus'],
        disciplinaryStatus: createdRecord.disciplinaryStatus as UniversityStudentRecord['disciplinaryStatus'],
        isSuspended: createdRecord.suspensionStatus === 'ACTIVE' || createdRecord.disciplinaryStatus === 'SUSPENDED',
        isExpelled: createdRecord.expulsionStatus === 'ACTIVE' || createdRecord.disciplinaryStatus === 'EXPELLED',
      };
    }
    /*
      return {
        verified: false,
        student: null,
        eligibility: {
          status: 'VERIFICATION_FAILED',
          reasons: ['University record not found.'],
        },
      };
    }

    const createdRecord = await prisma.universityStudent.upsert({
      where: { universityStudentId: simulated.studentNumber },
      update: {
        fullName: simulated.name,
        dateOfBirth: new Date(simulated.dateOfBirth),
        gender: simulated.gender,
        photoUrl: simulated.photoUrl,
        enrollmentStatus: simulated.enrollmentStatus,
        academicStatus: simulated.academicStatus,
        disciplinaryStatus: simulated.disciplinaryStatus,
        suspensionStatus: simulated.isSuspended ? 'ACTIVE' : 'NONE',
        expulsionStatus: simulated.isExpelled ? 'ACTIVE' : 'NONE',
        updatedAt: new Date(),
      },
      create: {
        universityId: university.id,
        universityStudentId: simulated.studentNumber,
        registrationNumber: `${simulated.universityCode}-${Date.now()}`,
        fullName: simulated.name,
        dateOfBirth: new Date(simulated.dateOfBirth),
        gender: simulated.gender,
        photoUrl: simulated.photoUrl,
        admissionDate: new Date(),
        expectedGraduationDate: new Date(),
        actualGraduationDate: null,
        enrollmentStatus: simulated.enrollmentStatus,
        academicStatus: simulated.academicStatus,
        graduationStatus: simulated.enrollmentStatus === 'GRADUATED' ? 'COMPLETED' : 'IN_PROGRESS',
        suspensionStatus: simulated.isSuspended ? 'ACTIVE' : 'NONE',
        expulsionStatus: simulated.isExpelled ? 'ACTIVE' : 'NONE',
        disciplinaryStatus: simulated.disciplinaryStatus,
      },
    });

    student = {
      id: createdRecord.id,
      studentNumber: createdRecord.universityStudentId,
      universityCode: universityCode,
      name: createdRecord.fullName,
      dateOfBirth: createdRecord.dateOfBirth.toISOString(),
      gender: createdRecord.gender ?? 'Unknown',
      photoUrl: createdRecord.photoUrl ?? '',
      enrollmentStatus: createdRecord.enrollmentStatus as UniversityStudentRecord['enrollmentStatus'],
      academicStatus: createdRecord.academicStatus as UniversityStudentRecord['academicStatus'],
      disciplinaryStatus: createdRecord.disciplinaryStatus as UniversityStudentRecord['disciplinaryStatus'],
      isSuspended: createdRecord.suspensionStatus === 'ACTIVE' || createdRecord.disciplinaryStatus === 'SUSPENDED',
      isExpelled: createdRecord.expulsionStatus === 'ACTIVE' || createdRecord.disciplinaryStatus === 'EXPELLED',
    };
    */
  }

  const eligibilityRules = evaluateEligibility(mapToEligibilityInput(student));
  const eligible = eligibilityRules.every((rule) => rule.passed);

  return {
    verified: true,
    student: toVerificationRecord(student),
    eligibility: {
      status: eligible ? 'ELIGIBLE' : 'INELIGIBLE',
      reasons: eligibilityRules.filter((rule) => !rule.passed).map((rule) => rule.reason ?? rule.rule),
    },
  };
};

export const verifyUniversityStudentRecord = async (universityStudentId: string) => {
  const dbRecord = await prisma.universityStudent.findUnique({
    where: { id: universityStudentId },
    include: { university: true },
  });

  if (!dbRecord || !dbRecord.university) {
    return {
      verified: false,
      student: null,
      eligibility: {
        status: 'VERIFICATION_FAILED',
        reasons: ['University student record not found.'],
      },
    };
  }

  return verifyUniversityStudent(dbRecord.universityStudentId, dbRecord.university.code);
};
