import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import {
  createCompetition,
  getCompetitionById,
  listCompetitions,
  registerTeamForCompetition,
  submitCompetitionResult,
  getCompetitionLeaderboard,
} from '../controllers/competitions.controller.js';

export const competitionsRouter = Router();

competitionsRouter.get('/', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH', 'TEAM_CAPTAIN'), listCompetitions);
competitionsRouter.get('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH', 'TEAM_CAPTAIN'), getCompetitionById);
competitionsRouter.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER'), createCompetition);
competitionsRouter.post('/:competitionId/register', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH', 'TEAM_CAPTAIN'), registerTeamForCompetition);
competitionsRouter.post('/:competitionId/results', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER'), submitCompetitionResult);
competitionsRouter.get('/:competitionId/leaderboard', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH', 'TEAM_CAPTAIN'), getCompetitionLeaderboard);
