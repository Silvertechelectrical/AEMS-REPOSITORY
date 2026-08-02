export type Role =
  | 'SUPER_ADMIN'
  | 'KUSF_ADMIN'
  | 'UNIVERSITY_ADMIN'
  | 'SPORTS_OFFICER'
  | 'TEAM_CAPTAIN'
  | 'COACH'
  | 'ATHLETE'
  | 'MATCH_OFFICIAL'
  | 'REFEREE'
  | 'VIEWER';

export const ROLES: Role[] = [
  'SUPER_ADMIN',
  'KUSF_ADMIN',
  'UNIVERSITY_ADMIN',
  'SPORTS_OFFICER',
  'TEAM_CAPTAIN',
  'COACH',
  'ATHLETE',
  'MATCH_OFFICIAL',
  'REFEREE',
  'VIEWER',
];

export const DEFAULT_PUBLIC_ROLE: Role = 'ATHLETE';

export const isValidRole = (r: string): r is Role => ROLES.includes(r as Role);

export default {
  ROLES,
  DEFAULT_PUBLIC_ROLE,
  isValidRole,
};
