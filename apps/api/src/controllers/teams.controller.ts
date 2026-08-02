import { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { teams } from '../services/store.service.js';

export const listTeams = (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (user.role === 'SUPER_ADMIN' || user.role === 'KUSF_ADMIN') {
    return res.json(ok(teams));
  }

  if (user.role === 'UNIVERSITY_ADMIN' || user.role === 'COACH' || user.role === 'TEAM_CAPTAIN') {
    const universityTeams = teams.filter((team) => team.universityId === user.universityId);
    return res.json(ok(universityTeams));
  }

  return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
};

export const createTeam = (req: Request, res: Response) => {
  const payload = req.body as { name?: string; universityId?: string; sportId?: string; coachId?: string; athletes?: string[] };
  if (!payload.name || !payload.universityId || !payload.sportId || !payload.coachId) {
    return res.status(400).json({ message: 'Team name, university, sport, and coach are required' });
  }

  return res.status(201).json(ok({ id: `team-${Date.now()}`, ...payload, athletes: payload.athletes ?? [] }));
};

export const updateTeam = (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  return res.json(ok({ id, ...payload }));
};

export const deleteTeam = (req: Request, res: Response) => {
  const { id } = req.params;
  return res.json(ok({ deletedTeamId: id }));
};
