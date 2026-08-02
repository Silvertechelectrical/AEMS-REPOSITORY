import type { Role } from '../constants/roles.js';

export type UniversityRecord = {
  id: string;
  name: string;
  code: string;
  location: string;
  status: 'ACTIVE' | 'INACTIVE';
};

export type SportRecord = {
  id: string;
  name: string;
  category: string;
};

export type AthleteRecord = {
  id: string;
  fullName: string;
  registrationNumber: string;
  sport: string;
  universityId: string;
  eligibilityStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  age: number;
  enrolled: boolean;
  activeAcademicStatus: boolean;
  hasDisciplinarySuspension: boolean;
  hasMultipleUniversities: boolean;
  competitionLimitReached: boolean;
};

export type TeamRecord = {
  id: string;
  name: string;
  universityId: string;
  sportId: string;
  coachId: string;
  athletes: string[];
};

export type DocumentRecord = {
  id: string;
  athleteId: string;
  documentType: string;
  fileUrl: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
};

export const universities: UniversityRecord[] = [
  { id: 'uni-1', name: 'University of Nairobi', code: 'UON', location: 'Nairobi', status: 'ACTIVE' },
  { id: 'uni-2', name: 'Kenyatta University', code: 'KU', location: 'Nairobi', status: 'ACTIVE' },
  { id: 'uni-3', name: 'Jomo Kenyatta University', code: 'JKUAT', location: 'Nairobi', status: 'ACTIVE' },
];

export const sports: SportRecord[] = [
  { id: 'sport-1', name: 'Football', category: 'Team Sport' },
  { id: 'sport-2', name: 'Basketball', category: 'Team Sport' },
  { id: 'sport-3', name: 'Athletics', category: 'Track & Field' },
  { id: 'sport-4', name: 'Volleyball', category: 'Team Sport' },
];

export const athletes: AthleteRecord[] = [
  {
    id: 'ath-1',
    fullName: 'John Otieno',
    registrationNumber: 'UON/CS/2026/001',
    sport: 'Football',
    universityId: 'uni-1',
    eligibilityStatus: 'APPROVED',
    age: 23,
    enrolled: true,
    activeAcademicStatus: true,
    hasDisciplinarySuspension: false,
    hasMultipleUniversities: false,
    competitionLimitReached: false,
  },
  {
    id: 'ath-2',
    fullName: 'Grace Wanjiku',
    registrationNumber: 'KU/BS/2026/014',
    sport: 'Basketball',
    universityId: 'uni-2',
    eligibilityStatus: 'PENDING',
    age: 21,
    enrolled: true,
    activeAcademicStatus: true,
    hasDisciplinarySuspension: false,
    hasMultipleUniversities: false,
    competitionLimitReached: true,
  },
];

export const teams: TeamRecord[] = [
  {
    id: 'team-1',
    name: 'UON Falcons',
    universityId: 'uni-1',
    sportId: 'sport-1',
    coachId: 'coach-1',
    athletes: ['ath-1'],
  },
  {
    id: 'team-2',
    name: 'KU Lions',
    universityId: 'uni-2',
    sportId: 'sport-2',
    coachId: 'coach-2',
    athletes: ['ath-2'],
  },
];

export const documents: DocumentRecord[] = [
  {
    id: 'doc-1',
    athleteId: 'ath-1',
    documentType: 'ID',
    fileUrl: '/storage/athletes/ath-1/id.jpg',
    verificationStatus: 'VERIFIED',
  },
];
