import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { listTeams, createTeam, updateTeam, deleteTeam } from '../controllers/teams.controller.js';

export const teamsRouter = Router();

teamsRouter.get('/', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'COACH', 'TEAM_CAPTAIN'), listTeams);
teamsRouter.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'COACH'), createTeam);
teamsRouter.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'COACH'), updateTeam);
teamsRouter.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN'), deleteTeam);
