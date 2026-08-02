export type EligibilityRuleResult = {
  rule: string;
  passed: boolean;
  reason?: string;
};

export const evaluateEligibility = (input: {
  age: number;
  enrolled: boolean;
  activeAcademicStatus: boolean;
  hasDisciplinarySuspension: boolean;
  hasMultipleUniversities: boolean;
  competitionLimitReached: boolean;
}): EligibilityRuleResult[] => {
  const rules: EligibilityRuleResult[] = [
    {
      rule: 'Age <= 25',
      passed: input.age <= 25,
      reason: input.age > 25 ? 'Athlete age exceeds competition limit.' : undefined,
    },
    {
      rule: 'Currently enrolled',
      passed: input.enrolled,
      reason: !input.enrolled ? 'Athlete is not currently enrolled.' : undefined,
    },
    {
      rule: 'Active academic status',
      passed: input.activeAcademicStatus,
      reason: !input.activeAcademicStatus ? 'Academic status is inactive.' : undefined,
    },
    {
      rule: 'No active disciplinary suspension',
      passed: !input.hasDisciplinarySuspension,
      reason: input.hasDisciplinarySuspension ? 'Athlete has an active disciplinary suspension.' : undefined,
    },
    {
      rule: 'Single university registration',
      passed: !input.hasMultipleUniversities,
      reason: input.hasMultipleUniversities ? 'Athlete is already registered with another university.' : undefined,
    },
    {
      rule: 'Competition allowance not exceeded',
      passed: !input.competitionLimitReached,
      reason: input.competitionLimitReached ? 'Athlete has exceeded competition entry limits.' : undefined,
    },
  ];

  return rules;
};
