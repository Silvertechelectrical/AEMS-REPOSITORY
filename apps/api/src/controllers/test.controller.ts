import { Request, Response } from 'express';

export const protectedTest = async (req: Request, res: Response) => {
  return res.json({ message: 'protected', user: req.user || null });
};
