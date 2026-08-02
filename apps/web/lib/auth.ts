export type AppUser = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  universityId?: string | null;
};

export const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('kusf_token');
};

export const getStoredUser = (): AppUser | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem('kusf_user');
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
};

export const setStoredAuth = (token: string, user: AppUser | null) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem('kusf_token', token);
  if (user) {
    window.localStorage.setItem('kusf_user', JSON.stringify(user));
  }
};

export const clearStoredAuth = () => {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem('kusf_token');
  window.localStorage.removeItem('kusf_user');
};

export const isOfficerRole = (role?: string) => ['SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH'].includes(role ?? '');
export const isAthleteLikeRole = (role?: string) => ['ATHLETE', 'TEAM_CAPTAIN'].includes(role ?? '');
