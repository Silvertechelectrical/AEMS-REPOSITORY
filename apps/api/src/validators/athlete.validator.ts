import { z } from 'zod';

export const athleteSchema = z.object({
  fullName: z.string().min(2),
  registrationNumber: z.string().min(4),
  sport: z.string().min(2),
  universityId: z.string().uuid(),
});
