-- Seed data for testing workflows
-- Run this in Supabase SQL editor after schema.sql applied

BEGIN;

-- Universities
INSERT INTO "University" ("id","name","code","location") VALUES
('univ_kusf','KUSF National University','KUSF','Seoul');

-- Sports
INSERT INTO "Sport" ("id","name","category") VALUES
('sport_football','Football','Team'),
('sport_athletics','Athletics','Individual');

-- Users
INSERT INTO "User" ("id","name","email","passwordHash","role","approved","universityId") VALUES
('user_super','Super Admin','super@kusf.example','<hashed-password>','SUPER_ADMIN',true,NULL),
('user_kusf','KUSF Admin','admin@kusf.example','<hashed-password>','KUSF_ADMIN',true,NULL),
('user_univ_admin','Univ Admin','uadmin@kusf.example','<hashed-password>','UNIVERSITY_ADMIN',true,'univ_kusf'),
('user_coach','Coach User','coach@kusf.example','<hashed-password>','COACH',true,'univ_kusf'),
('user_athlete','Athlete User','athlete@kusf.example','<hashed-password>','ATHLETE',true,'univ_kusf');

-- UniversityStudent (authoritative record)
INSERT INTO "UniversityStudent" ("id","universityId","universityStudentId","registrationNumber","fullName","dateOfBirth","gender","photoUrl","enrollmentStatus","academicStatus","graduationStatus","suspensionStatus","expulsionStatus","disciplinaryStatus") VALUES
('ustud_001','univ_kusf','U2024001','REG2024001','Kim Athlete','2001-05-10 00:00:00','M',NULL,'ENROLLED','GOOD','NOT_GRADUATED','NOT_SUSPENDED','NOT_EXPELLED','CLEAR');

-- Athletes
INSERT INTO "Athlete" ("id","userId","university_student_id","fullName","dateOfBirth","gender","nationality","phone","profilePhoto","universityId","sportId","eligibilityStatus","verificationStatus") VALUES
('ath_001','user_athlete','ustud_001','Kim Athlete','2001-05-10 00:00:00','M','KOR','+821012345678',NULL,'univ_kusf','sport_athletics','APPROVED','VERIFIED');

-- Teams
INSERT INTO "Team" ("id","name","universityId","sportId","coachId") VALUES
('team_kusf_athletics','KUSF Athletics Team','univ_kusf','sport_athletics','user_coach');

-- TeamAthlete
INSERT INTO "TeamAthlete" ("id","teamId","athleteId") VALUES
('ta_001','team_kusf_athletics','ath_001');

-- Competition
INSERT INTO "Competition" ("id","name","date","location") VALUES
('comp_001','KUSF Summer Games','2026-08-15 09:00:00','Seoul Stadium');

-- CompetitionTeam (register the team)
INSERT INTO "CompetitionTeam" ("id","competitionId","teamId") VALUES
('ct_001','comp_001','team_kusf_athletics');

-- Documents
INSERT INTO "Document" ("id","athleteId","documentType","fileUrl","verificationStatus") VALUES
('doc_ath_001','ath_001','ID_CARD','https://example.com/id_ath_001.jpg','VERIFIED');

-- EligibilityRecord
INSERT INTO "EligibilityRecord" ("id","athleteId","academicStatus","verificationStatus","approvalHistory") VALUES
('elig_001','ath_001','Good','VERIFIED','{"approvedBy":"user_univ_admin","at":"2026-07-01T10:00:00Z"}');

-- QrToken (sample token not yet used)
INSERT INTO "QrToken" ("id","token","athleteId","expiresAt") VALUES
('qr_001','sample-token-abc123','ath_001','2026-08-15 12:00:00');

-- Notifications & AuditLog sample
INSERT INTO "Notification" ("id","userId","title","message","type") VALUES
('n_001','user_athlete','Welcome','Your account has been created','INFO');

INSERT INTO "AuditLog" ("id","userId","action","resourceType","resourceId") VALUES
('aud_001','user_univ_admin','CREATE_ELIGIBILITY','EligibilityRecord','elig_001');

COMMIT;
