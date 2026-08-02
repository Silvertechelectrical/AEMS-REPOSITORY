import path from 'path';
import { config } from 'dotenv';
import app from './app.js';
import { connectDatabase, ensureSeedData } from './lib/prisma.js';

config({ path: path.resolve(process.cwd(), '.env') });

const port = Number(process.env.PORT || 4000);

app.listen(port, async () => {
  try {
    await connectDatabase();
    await ensureSeedData();
    console.log('Database connected successfully.');
  } catch (error) {
    console.warn('Database connection unavailable; continuing in local fallback mode:', error);
  }
  console.log(`KUSF AEMS API listening on http://localhost:${port}`);
});
