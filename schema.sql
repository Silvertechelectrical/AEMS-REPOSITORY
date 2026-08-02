-- CreateSchema

CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM (
  'SUPER_ADMIN',
  'KUSF_ADMIN',
  'UNIVERSITY_ADMIN',
  'SPORTS_OFFICER',
  'TEAM_CAPTAIN',
  'COACH',
  'ATHLETE',
  'MATCH_OFFICIAL',
  'REFEREE',
  'VIEWER'
);

CREATE TYPE "EligibilityStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "approved" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "universityId" TEXT,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RefreshToken" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "University" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Sport" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Sport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Athlete" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "university_student_id" TEXT,
  "fullName" TEXT NOT NULL,
  "dateOfBirth" TIMESTAMP(3) NOT NULL,
  "gender" TEXT NOT NULL,
  "nationality" TEXT NOT NULL,
  "phone" TEXT,
  "profilePhoto" TEXT,
  "universityId" TEXT NOT NULL,
  "sportId" TEXT NOT NULL,
  "eligibilityStatus" "EligibilityStatus" NOT NULL DEFAULT 'PENDING',
  "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Athlete_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Team" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "universityId" TEXT NOT NULL,
  "sportId" TEXT NOT NULL,
  "coachId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeamAthlete" (
  "id" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "athleteId" TEXT NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TeamAthlete_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Competition" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "location" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompetitionTeam" (
  "id" TEXT NOT NULL,
  "competitionId" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  CONSTRAINT "CompetitionTeam_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EligibilityRecord" (
  "id" TEXT NOT NULL,
  "athleteId" TEXT NOT NULL,
  "academicStatus" TEXT NOT NULL,
  "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "approvalHistory" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EligibilityRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Document" (
  "id" TEXT NOT NULL,
  "athleteId" TEXT NOT NULL,
  "documentType" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "verificationStatus" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UniversityStudent" (
  "id" TEXT NOT NULL,
  "universityId" TEXT NOT NULL,
  "universityStudentId" TEXT NOT NULL,
  "registrationNumber" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "dateOfBirth" TIMESTAMP(3) NOT NULL,
  "gender" TEXT,
  "photoUrl" TEXT,
  "admissionDate" TIMESTAMP(3),
  "expectedGraduationDate" TIMESTAMP(3),
  "actualGraduationDate" TIMESTAMP(3),
  "enrollmentStatus" TEXT NOT NULL,
  "academicStatus" TEXT NOT NULL,
  "graduationStatus" TEXT NOT NULL,
  "suspensionStatus" TEXT NOT NULL,
  "expulsionStatus" TEXT NOT NULL,
  "disciplinaryStatus" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UniversityStudent_pkey" PRIMARY KEY ("id")
);

-- New enums for notifications, reports, and appeals/audit
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'ALERT', 'ACTION_REQUIRED');
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
CREATE TYPE "ReportFormat" AS ENUM ('JSON', 'CSV');
CREATE TYPE "AppealStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');

-- CreateTable: Notification
CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL DEFAULT 'INFO',
  "read" BOOLEAN NOT NULL DEFAULT FALSE,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AuditLog
CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "resourceType" TEXT,
  "resourceId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Report
CREATE TABLE "Report" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
  "format" "ReportFormat" NOT NULL DEFAULT 'JSON',
  "requestedBy" TEXT,
  "resultUrl" TEXT,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable: QrToken
CREATE TABLE "QrToken" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "athleteId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QrToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AttendanceRecord
CREATE TABLE "AttendanceRecord" (
  "id" TEXT NOT NULL,
  "athleteId" TEXT NOT NULL,
  "qrTokenId" TEXT NOT NULL,
  "competitionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CompetitionResult
CREATE TABLE "CompetitionResult" (
  "id" TEXT NOT NULL,
  "competitionId" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "position" INTEGER,
  "score" NUMERIC,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompetitionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable: DisciplinaryCase
CREATE TABLE "DisciplinaryCase" (
  "id" TEXT NOT NULL,
  "athleteId" TEXT NOT NULL,
  "caseType" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DisciplinaryCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Appeal
CREATE TABLE "Appeal" (
  "id" TEXT NOT NULL,
  "disciplinaryCaseId" TEXT NOT NULL,
  "appellantId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" "AppealStatus" NOT NULL DEFAULT 'OPEN',
  "reviewerId" TEXT,
  "decision" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "Appeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User" ("email");
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken" ("token");
CREATE UNIQUE INDEX "University_name_key" ON "University" ("name");
CREATE UNIQUE INDEX "University_code_key" ON "University" ("code");
CREATE UNIQUE INDEX "Sport_name_key" ON "Sport" ("name");
CREATE UNIQUE INDEX "Athlete_userId_key" ON "Athlete" ("userId");
CREATE UNIQUE INDEX "TeamAthlete_teamId_athleteId_key" ON "TeamAthlete" ("teamId", "athleteId");
CREATE UNIQUE INDEX "CompetitionTeam_competitionId_teamId_key" ON "CompetitionTeam" ("competitionId", "teamId");
CREATE UNIQUE INDEX "UniversityStudent_universityStudentId_key" ON "UniversityStudent" ("universityStudentId");
CREATE UNIQUE INDEX "QrToken_token_key" ON "QrToken" ("token");
CREATE INDEX "Notification_userId_idx" ON "Notification" ("userId");
CREATE INDEX "AttendanceRecord_athleteId_idx" ON "AttendanceRecord" ("athleteId");
CREATE INDEX "AttendanceRecord_qrTokenId_idx" ON "AttendanceRecord" ("qrTokenId");
CREATE INDEX "CompetitionResult_competitionId_idx" ON "CompetitionResult" ("competitionId");
CREATE INDEX "CompetitionResult_teamId_idx" ON "CompetitionResult" ("teamId");
CREATE INDEX "Appeal_disciplinaryCaseId_idx" ON "Appeal" ("disciplinaryCaseId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_universityStudentId_fkey" FOREIGN KEY ("university_student_id") REFERENCES "UniversityStudent" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TeamAthlete" ADD CONSTRAINT "TeamAthlete_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamAthlete" ADD CONSTRAINT "TeamAthlete_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompetitionTeam" ADD CONSTRAINT "CompetitionTeam_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompetitionTeam" ADD CONSTRAINT "CompetitionTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EligibilityRecord" ADD CONSTRAINT "EligibilityRecord_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UniversityStudent" ADD CONSTRAINT "UniversityStudent_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "QrToken" ADD CONSTRAINT "QrToken_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_qrTokenId_fkey" FOREIGN KEY ("qrTokenId") REFERENCES "QrToken" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CompetitionResult" ADD CONSTRAINT "CompetitionResult_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompetitionResult" ADD CONSTRAINT "CompetitionResult_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DisciplinaryCase" ADD CONSTRAINT "DisciplinaryCase_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_disciplinaryCaseId_fkey" FOREIGN KEY ("disciplinaryCaseId") REFERENCES "DisciplinaryCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_appellantId_fkey" FOREIGN KEY ("appellantId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
