import { describe, expect, it } from 'vitest';
import { verifyUniversityStudent } from '../services/university-verification.service.js';

describe('verifyUniversityStudent', () => {
  it('verifies an eligible student from the simulated university dataset', async () => {
    const result = await verifyUniversityStudent('UON/CS/2024/001', 'UON');

    expect(result.verified).toBe(true);
    expect(result.student?.name).toBe('John Otieno');
    expect(result.eligibility.status).toBe('ELIGIBLE');
    expect(result.eligibility.reasons).toEqual([]);
  });

  it('rejects a fake student number and explains the cause', async () => {
    const result = await verifyUniversityStudent('UON/FAKE/9999', 'UON');

    expect(result.verified).toBe(false);
    expect(result.eligibility.status).toBe('VERIFICATION_FAILED');
    expect(result.eligibility.reasons).toContain('Student record not found.');
  });
});
