import { Router } from 'express';
import { athletesRouter } from './athletes.routes.js';
import { authRouter } from './auth.routes.js';
import { dashboardRouter } from './dashboard.routes.js';
import { documentsRouter } from './documents.routes.js';
import { eligibilityRouter } from './eligibility.routes.js';
import { sportsRouter } from './sports.routes.js';
import { teamsRouter } from './teams.routes.js';
import { universitiesRouter } from './universities.routes.js';
import { testRouter } from './test.routes.js';
import { universityVerificationRouter } from './university-verification.routes.js';
import { qrRouter } from './qr.routes.js';
import { disciplinaryRouter } from './disciplinary.routes.js';
import { competitionsRouter } from './competitions.routes.js';
import { notificationsRouter } from './notifications.routes.js';
import { reportsRouter } from './reports.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'kusf-aems-api' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/universities', universitiesRouter);
apiRouter.use('/athletes', athletesRouter);
apiRouter.use('/sports', sportsRouter);
apiRouter.use('/teams', teamsRouter);
apiRouter.use('/documents', documentsRouter);
apiRouter.use('/eligibility', eligibilityRouter);
apiRouter.use('/university-verification', universityVerificationRouter);
apiRouter.use('/qr', qrRouter);
apiRouter.use('/disciplinary', disciplinaryRouter);
apiRouter.use('/competitions', competitionsRouter);
apiRouter.use('/test', testRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/reports', reportsRouter);
